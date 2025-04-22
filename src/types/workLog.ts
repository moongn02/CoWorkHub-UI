export interface WorkLogData {
    id?: number
    userId?: number
    content: string
    type: number | string
    typeText?: string
    logDate: string
    logDateStr?: string
    username?: string
    createTime?: string
    updateTime?: string
}

export interface WorkLogStatistics {
    submittedLogs: number
    requiredLogs: number
    percentage: number
}

export interface WorkLogQuery {
    dateRange: [Date, Date] | []
    year: Date | null
    month: Date | null
    logType: string | number
}