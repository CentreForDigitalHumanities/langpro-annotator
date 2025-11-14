
function sum(list: number[]) {
    return list.reduce((sum: number, h: number) => sum + h, 0);
}

function formatDate(date: string): string {
    const dateStr = new Date(date);
    return Intl.DateTimeFormat(undefined, { year: 'numeric', month: 'long', day: 'numeric' }).format(dateStr);
}

export { sum, formatDate };
