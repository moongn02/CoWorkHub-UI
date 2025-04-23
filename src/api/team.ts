import request from '@/utils/request'

// 获取部门人员树
export function getDepartmentPersonnel() {
    return request({
        url: '/api/team/personnel_tree',
        method: 'get'
    })
}

// 获取人员工作日志列表
export function pagePersonnelWorkLogs(params: any) {
    return request({
        url: '/api/team/personnel_logs',
        method: 'get',
        params
    })
}