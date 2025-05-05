// src/Common/Domain/Enums/Status.ts
export enum Status {
    Draft = 'DRAFT',
    Pending = 'PENDING',
    Approved = 'APPROVED',
    Rejected = 'REJECTED',
    Cancelled = 'CANCELLED',
}

// Type guard to check if a string is a valid Status
export function isValidStatus(status: string): status is Status {
    return Object.values(Status).includes(status as Status)
}

// Helper to get status display name (capitalized first letter, lowercase rest)
export function getStatusDisplayName(status: Status): string {
    const statusKey = Object.keys(Status).find(
        key => Status[key as keyof typeof Status] === status
    )
    if (!statusKey) return status

    return statusKey.charAt(0).toUpperCase() + statusKey.slice(1).toLowerCase()
}

// Helper to get status color based on the status
export function getStatusColor(status: Status): string {
    switch (status) {
        case Status.Draft:
            return '#ff9800' // Orange
        case Status.Pending:
            return '#2196f3' // Blue
        case Status.Approved:
            return '#4caf50' // Green
        case Status.Rejected:
            return '#f44336' // Red
        case Status.Cancelled:
            return '#757575' // Grey
        default:
            return '#757575' // Grey
    }
}
