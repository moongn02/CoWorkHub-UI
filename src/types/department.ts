// @/types/department.ts
export interface DepartmentData {
    name: string
    code?: string
    parentId?: string | number | null
    parentName?: string
    manager?: string
    managerName?: string
    description?: string
    status?: number
    order?: number
    [key: string]: any
}

export interface DepartmentQuery {
    page?: number
    pageSize?: number
    name?: string
    code?: string
    status?: number
    parentId?: string | number | null
    keyword?: string
    [key: string]: any
}
