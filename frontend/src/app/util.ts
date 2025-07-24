
function sum(list: number[]) {
    return list.reduce((sum: number, h: number) => sum + h, 0);
}

export {sum}
