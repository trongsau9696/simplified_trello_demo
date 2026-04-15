import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { useTranslation } from 'react-i18next'
import styles from './TaskStatusChart.module.css'

interface Props {
  data: {
    todo: number
    in_progress: number
    done: number
  }
}

export function TaskStatusChart({ data }: Props) {
  const { t } = useTranslation()

  const chartData = [
    { name: t('dashboard.summaryWidget.todo'), value: data.todo, color: '#6366f1' },
    { name: t('dashboard.summaryWidget.inProgress'), value: data.in_progress, color: '#f59e0b' },
    { name: t('dashboard.summaryWidget.done'), value: data.done, color: '#10b981' },
  ].filter(d => d.value > 0)

  if (chartData.length === 0) {
    return (
      <div className={styles.empty}>
        <p>No task data available for charting</p>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>{t('dashboard.chart.title')}</h3>
      <div className={styles.chartWrapper}>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                borderRadius: '12px', 
                border: 'none', 
                boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                background: 'var(--bg-secondary)',
                color: 'var(--text)'
              }}
            />
            <Legend verticalAlign="bottom" height={36}/>
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
