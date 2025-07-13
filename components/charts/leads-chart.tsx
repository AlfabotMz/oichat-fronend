"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

// Mock data for the chart - in a real app, this would come from your API
const chartData = [
  { date: "03/12", value: 12 },
  { date: "04/12", value: 18 },
  { date: "05/12", value: 3 },
  { date: "06/12", value: 5 },
  { date: "07/12", value: 2 },
  { date: "08/12", value: 3 },
  { date: "09/12", value: 7 },
]

export function LeadsChart() {
  const maxValue = Math.max(...chartData.map((d) => d.value))
  const totalLeads = chartData.reduce((sum, d) => sum + d.value, 0)

  return (
    <Card className="col-span-4 bg-card/50 backdrop-blur-sm border-border/40">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-xl font-bold text-foreground">Análise de Leads</CardTitle>
          <CardDescription className="text-muted-foreground">-12.5% vs período anterior</CardDescription>
        </div>
        <Badge className="gradient-bg text-white border-0">Leads Gerados</Badge>
      </CardHeader>
      <CardContent>
        <div className="text-4xl font-bold text-foreground mb-6">{totalLeads}</div>

        {/* Simple SVG Chart */}
        <div className="h-64 w-full">
          <svg viewBox="0 0 800 200" className="w-full h-full">
            <defs>
              <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Grid lines */}
            {[0, 5, 10, 15, 20].map((value) => (
              <line
                key={value}
                x1="60"
                y1={180 - (value / 20) * 160}
                x2="740"
                y2={180 - (value / 20) * 160}
                stroke="hsl(var(--border))"
                strokeWidth="1"
                opacity="0.3"
              />
            ))}

            {/* Chart area */}
            <path
              d={`M 60 ${180 - (chartData[0].value / maxValue) * 160} ${chartData
                .map((d, i) => `L ${60 + i * 110} ${180 - (d.value / maxValue) * 160}`)
                .join(" ")}`}
              fill="url(#chartGradient)"
              stroke="hsl(var(--primary))"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Data points */}
            {chartData.map((d, i) => (
              <circle
                key={i}
                cx={60 + i * 110}
                cy={180 - (d.value / maxValue) * 160}
                r="4"
                fill="hsl(var(--primary))"
                stroke="hsl(var(--background))"
                strokeWidth="2"
              />
            ))}

            {/* X-axis labels */}
            {chartData.map((d, i) => (
              <text key={i} x={60 + i * 110} y="195" textAnchor="middle" className="text-xs fill-muted-foreground">
                {d.date}
              </text>
            ))}

            {/* Y-axis labels */}
            {[0, 5, 10, 15, 20].map((value) => (
              <text
                key={value}
                x="50"
                y={185 - (value / 20) * 160}
                textAnchor="end"
                className="text-xs fill-muted-foreground"
              >
                {value}
              </text>
            ))}
          </svg>
        </div>
      </CardContent>
    </Card>
  )
}
