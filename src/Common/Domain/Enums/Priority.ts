// src/Common/Domain/Enums/Priority.ts
export const PRIORITY = {
    High: 1,
    Medium: 2,
    Low: 3,
}

// Type representing valid priority values
export type PriorityType = (typeof PRIORITY)[keyof typeof PRIORITY]

// Type guard to check if a number is a valid Priority
export function isValidPriority(priority: number): priority is PriorityType {
    return Object.values(PRIORITY).includes(priority)
}

// Helper to get priority display name
export function getPriorityDisplayName(priority: PriorityType): string {
    const entry = Object.entries(PRIORITY).find(
        ([_, value]) => value === priority
    )
    return entry ? entry[0] : 'Unknown'
}

// Helper to get priority color based on the priority
export function getPriorityColor(priority: PriorityType): string {
    switch (priority) {
        case PRIORITY.High:
            return '#ff5252' // Red
        case PRIORITY.Medium:
            return '#fb8c00' // Orange
        case PRIORITY.Low:
            return '#4caf50' // Green
        default:
            return '#757575' // Grey
    }
}
