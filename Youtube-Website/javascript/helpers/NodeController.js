


export default class NodeController {

    constructor() {
        const newProperties = this.__proto__.constructor.getNewProperties(...arguments);
        if ((newProperties.node instanceof Node) === false) {
            throw new Error("the getNewProperties function of a node controller must provide a property 'node' which is an instance of, or an instance of a subclass of Node");
        }
        Object.assign(this, newProperties);

        // to hold the NodeController in memory for as long as the node is being held.
        this.node.controller = this;
    }

    nodeWasAddedToDocument() {

    }

    nodeWasRemovedFromDocument() {

    }

    // must, at at the very least, contain a property 'node' which is to be the node this NodeController will control.
    static getNewProperties() {
        return {};
    }

}



(() => {

    const observer = new MutationObserver(records => {

        const NodeCheckingPurpose = {
            FOR_ADDITION: Symbol("addition"),
            FOR_REMOVAL: Symbol("removal")
        }

        function checkNode(node, purpose) {
            const controller = node.controller;

            if (controller instanceof NodeController) {
                switch (purpose) {
                    case NodeCheckingPurpose.FOR_ADDITION:
                        controller.nodeWasAddedToDocument();
                        break;
                    case NodeCheckingPurpose.FOR_REMOVAL:
                        controller.nodeWasRemovedFromDocument();
                        break;
                }
            }

            for (const child of node.childNodes) {
                checkNode(child, purpose);
            }

        }

        for (const record of records) {
            for (const addedNode of record.addedNodes) {
                checkNode(addedNode, NodeCheckingPurpose.FOR_ADDITION);
            }
            for (const removedNode of record.removedNodes) {
                checkNode(removedNode, NodeCheckingPurpose.FOR_REMOVAL);
            }
        }
    });

    observer.observe(document, { childList: true, subtree: true });

})();


