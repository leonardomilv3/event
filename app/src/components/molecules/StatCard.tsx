import GlassPanel from './GlassPanel'

interface StatCardProps {
  label: string
  value: string | number
  accent?: boolean
  extra?: React.ReactNode
  className?: string
}

export default function StatCard({ label, value, accent = false, extra, className = '' }: StatCardProps) {
  return (
    <GlassPanel className={['p-6 flex flex-col justify-between h-32 border border-white/5', className].join(' ')}>
      <div className="flex justify-between items-start">
        <span className="text-on-surface-variant font-label-caps text-label-caps">{label}</span>
        {extra}
      </div>
      <div className={`text-display-lg-mobile font-serif leading-none ${accent ? 'text-primary-container' : 'text-on-surface'}`}>
        {value}
      </div>
    </GlassPanel>
  )
}
