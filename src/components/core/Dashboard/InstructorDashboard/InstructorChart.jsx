import { useState } from "react"
import { Chart, registerables } from "chart.js"
import { Pie, Doughnut } from "react-chartjs-2"

Chart.register(...registerables)

export default function InstructorChart({ courses }) {
  const [currChart, setCurrChart] = useState("students")
  const [chartType, setChartType] = useState("pie")

  // Premium color palettes
  const studentsColors = [
    "#4F46E5", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899", "#06B6D4"
  ]
  const incomeColors = [
    "#FBBF24", "#F59E0B", "#D97706", "#B45309", "#92400E", "#78350F", "#451A03"
  ]

  const chartDataStudents = {
    labels: courses.map((course) => course.courseName),
    datasets: [
      {
        data: courses.map((course) => course.totalStudentsEnrolled),
        backgroundColor: studentsColors,
        borderColor: "#161D29",
        borderWidth: 2,
        hoverOffset: 20
      },
    ],
  }

  const chartIncomeData = {
    labels: courses.map((course) => course.courseName),
    datasets: [
      {
        data: courses.map((course) => course.totalAmountGenerated),
        backgroundColor: incomeColors,
        borderColor: "#161D29",
        borderWidth: 2,
        hoverOffset: 20
      },
    ],
  }

  const options = {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: '#AFB2BF',
          font: { size: 12 },
          padding: 20,
          usePointStyle: true,
        }
      }
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-xl font-bold text-richblack-5">Revenue Insights</p>
        <div className="flex bg-richblack-900 rounded-lg p-1 border border-richblack-700">
          <button
            onClick={() => setCurrChart("students")}
            className={`rounded-md px-4 py-1.5 text-xs font-bold transition-all ${currChart === "students" ? "bg-richblack-700 text-yellow-50" : "text-richblack-300"
              }`}
          >
            Students
          </button>
          <button
            onClick={() => setCurrChart("income")}
            className={`rounded-md px-4 py-1.5 text-xs font-bold transition-all ${currChart === "income" ? "bg-richblack-700 text-yellow-50" : "text-richblack-300"
              }`}
          >
            Income
          </button>
        </div>
        <div className="flex bg-richblack-900 rounded-lg p-1 border border-richblack-700">
          <button
            onClick={() => setChartType("pie")}
            className={`rounded-md px-4 py-1.5 text-xs font-bold transition-all ${chartType === "pie" ? "bg-richblack-700 text-yellow-50" : "text-richblack-300"
              }`}
          >
            Pie
          </button>
          <button
            onClick={() => setChartType("doughnut")}
            className={`rounded-md px-4 py-1.5 text-xs font-bold transition-all ${chartType === "doughnut" ? "bg-richblack-700 text-yellow-50" : "text-richblack-300"
              }`}
          >
            Doughnut
          </button>
        </div>
      </div>

      <div className="relative mx-auto aspect-square min-h-[300px] w-full max-w-[500px]">
        {chartType === "pie" ? (
          <Pie
            data={currChart === "students" ? chartDataStudents : chartIncomeData}
            options={options}
          />
        ) : (
          <Doughnut
            data={currChart === "students" ? chartDataStudents : chartIncomeData}
            options={options}
          />
        )}
      </div>
    </div>
  )
}