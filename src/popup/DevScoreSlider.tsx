import { t } from '../i18n'

interface DevScoreSliderProps {
  score: number
  onChange: (score: number) => void
}

export default function DevScoreSlider({ score, onChange }: DevScoreSliderProps) {
  return (
    <div className="dev-slider">
      <label htmlFor="dev-score">{t('dev.overrideScore', { score })}</label>
      <input
        id="dev-score"
        type="range"
        min={0}
        max={100}
        value={score}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  )
}
