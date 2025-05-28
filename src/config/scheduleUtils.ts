export function isTimeOverlapping(start1: string, end1: string, start2: string, end2: string) {
    return start1 < end2 && start2 < end1;
}

export function isConflict(newItem, existingItem) {
    const isSameDay = newItem.haftaKuni === existingItem.haftaKuni;
    if (!isSameDay) return false;
    
    const isTimeConflict = isTimeOverlapping(
        newItem.boshlanishVaqti,
        newItem.tugashVaqti,
        existingItem.boshlanishVaqti,
        existingItem.tugashVaqti
    );
    if (!isTimeConflict) return false;
    
    return (
        newItem.darsXonalariId === existingItem.darsXonalariId ||
        newItem.oqituvchilarId === existingItem.oqituvchilarId ||
        newItem.guruhlarId === existingItem.guruhlarId
    );
}

export function getAvailableResources(newItem, scheduleList) {
    const conflictingItems = scheduleList.filter(item => isConflict(newItem, item));
    
    const occupiedRooms = new Set(conflictingItems.map(item => item.darsXonalariId));
    const occupiedTeachers = new Set(conflictingItems.map(item => item.oqituvchilarId));
    const occupiedGroups = new Set(conflictingItems.map(item => item.guruhlarId));
    
    return {
        availableRooms: occupiedRooms,
        availableTeachers: occupiedTeachers,
        availableGroups: occupiedGroups
    };
}