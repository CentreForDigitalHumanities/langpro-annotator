
interface TreeNode<T> {
    value: T;
    children: TreeNode<T>[];
}

class Tree<T> {
    _root?: TreeNode<T>;

    get root(): TreeNode<T> {
        if (!this._root) {
            throw new Error("Tree is empty")
        }
        return this._root;
    }

    constructor(root?: TreeNode<T>) {
        this._root = root;
    }

    static empty<T>(): Tree<T> {
        return new Tree();
    }

    static fromJSON<T>(json: any): Tree<T> {
        // there's no validation of the content
        return new Tree(json);
    }
}

export {Tree, TreeNode};
