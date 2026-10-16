#!/usr/bin/env bash
# Verifica as convenções do vault docs/ (ver docs/vault-guide.md).
# Uso: bash scripts/check-vault.sh   (sai com 1 se houver problema)
set -u

cd "$(dirname "$0")/.." || exit 2
VAULT=docs
errors=0

report() { # categoria arquivo:linha mensagem
  printf '  [%s] %s  %s\n' "$1" "$2" "$3"
  errors=$((errors + 1))
}

# Todas as notas do vault, exceto a configuração do Obsidian
mapfile -d '' NOTES < <(find "$VAULT" -name '*.md' -not -path "$VAULT/.obsidian/*" -print0 | sort -z)

# --- 1. Frontmatter -----------------------------------------------------------
echo "Frontmatter (type, status, date)..."
for f in "${NOTES[@]}"; do
  case "$f" in "$VAULT"/_templates/*) continue ;; esac
  while IFS=$'\t' read -r line msg; do
    report frontmatter "$f:$line" "$msg"
  done < <(awk '
    NR == 1 && $0 != "---" { print "1\tsem frontmatter (primeira linha deve ser ---)"; bad = 1; exit }
    NR > 1 && $0 == "---" { closed = NR; exit }
    NR > 1 && match($0, /^(type|status|date):[[:space:]]*/) {
      key = substr($0, 1, index($0, ":") - 1)
      val = substr($0, RLENGTH + 1); sub(/[[:space:]]+(#.*)?$/, "", val)
      v[key] = val; l[key] = NR
    }
    END {
      if (bad) exit
      if (!closed) { print "1\tfrontmatter sem --- de fechamento"; exit }
      n = split("type status date", keys, " ")
      for (i = 1; i <= n; i++) if (!(keys[i] in v) || v[keys[i]] == "") print "1\tcampo obrigatório ausente: " keys[i]
      if ("date" in v && v["date"] != "" && v["date"] !~ /^[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]$/)
        print l["date"] "\tdate fora do formato AAAA-MM-DD: " v["date"]
      t = v["type"]; s = v["status"]
      if (t != "" && t !~ /^(index|product|architecture|reference|adr|decision-log|runbook|experiment|prompt|journal|postmortem)$/)
        print l["type"] "\ttype inválido: " t
      else if (s != "") {
        if (t == "adr") ok = "^(proposed|accepted|superseded|deprecated)$"
        else if (t == "prompt") ok = "^(draft|executed|superseded)$"
        else if (t == "experiment") ok = "^(draft|running|concluded)$"
        else ok = "^(draft|current|archived)$"
        if (s !~ ok) print l["status"] "\tstatus \"" s "\" inválido para type " t
      }
    }' "$f")
done

# Linhas fora de blocos de código, com código inline removido: "NR<TAB>texto"
prose() {
  awk '/^[[:space:]]*(```|~~~)/ { code = !code; next }
       !code { line = $0; gsub(/`[^`]*`/, "", line); print NR "\t" line }' "$1"
}

# --- 2. Wikilinks -------------------------------------------------------------
echo "Wikilinks..."
for f in "${NOTES[@]}"; do
  while IFS=$'\t' read -r n _; do
    report wikilink "$f:$n" "use link Markdown relativo em vez de [[...]]"
  done < <(prose "$f" | grep -E $'^[0-9]+\t.*\\[\\[[^]]+\\]\\]')
done

# --- 3. Links relativos -------------------------------------------------------
echo "Links relativos..."
for f in "${NOTES[@]}"; do
  dir=$(dirname "$f")
  while IFS=$'\t' read -r n target; do
    case "$target" in
      http://* | https://* | mailto:* | tel:* | '#'* | '') continue ;;
    esac
    path=${target%%#*}; path=${path%%\?*}; path=${path//%20/ }
    [ -z "$path" ] && continue
    case "$path" in /*) report link "$f:$n" "link absoluto, use relativo: $target"; continue ;; esac
    [ -e "$dir/$path" ] || report link "$f:$n" "arquivo inexistente: $target"
  done < <(prose "$f" | awk -F'\t' '{
      n = $1; line = substr($0, length(n) + 2)
      while (match(line, /\]\([^)]*\)/)) {
        t = substr(line, RSTART + 2, RLENGTH - 3)
        sub(/^[[:space:]]*</, "", t); sub(/>.*$/, "", t); sub(/[[:space:]].*$/, "", t)
        print n "\t" t
        line = substr(line, RSTART + RLENGTH)
      }
    }')
done

# --- 4. Segredos (inclui blocos de código; nunca imprime o valor) -------------
echo "Padrões de segredo..."
for f in "${NOTES[@]}"; do
  while IFS=$'\t' read -r n kind; do
    report segredo "$f:$n" "possível credencial ($kind); valor omitido"
  done < <(awk '{
      l = tolower($0)
      if (l ~ /sb_secret_/) k = "sb_secret"
      else if (l ~ /sb_publishable_/) k = "sb_publishable"
      else if ($0 ~ /BEGIN [A-Z ]*PRIVATE KEY/) k = "chave privada PEM"
      else if (l ~ /(password|passwd|senha)["'\'']?[[:space:]]*[:=][[:space:]]*["'\'']?[^[:space:]"'\''<>$*{`|]/) k = "password/senha com valor"
      else if (l ~ /[a-z][a-z0-9+.-]*:\/\/[^\/[:space:]:@]+:[^\/[:space:]@<>$*{]+@/) k = "URL com usuário:senha"
      else next
      print NR "\t" k
    }' "$f")
done

# --- 5. Numeração de ADR -----------------------------------------------------
echo "Numeração de ADR..."
while read -r num; do
  files=$(find "$VAULT/adrs" -maxdepth 1 -name "${num}-*.md" -printf '%f ' | sort)
  report adr "$VAULT/adrs" "número $num duplicado: $files"
done < <(find "$VAULT/adrs" -maxdepth 1 -name '[0-9]*-*.md' -printf '%f\n' | sed -E 's/^([0-9]+)-.*/\1/' | sort | uniq -d)

echo
if [ "$errors" -gt 0 ]; then
  echo "check-vault: $errors problema(s) em ${#NOTES[@]} nota(s)."
  exit 1
fi
echo "check-vault: OK (${#NOTES[@]} notas)."
