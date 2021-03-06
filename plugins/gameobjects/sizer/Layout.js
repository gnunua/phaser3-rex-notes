import NOOP from 'rexPlugins/utils/object/NOOP.js';

const Zone = Phaser.GameObjects.Zone;
const AlignIn = Phaser.Display.Align.In.QuickSet;

var Layout = function (parent) {
    // Skip invisible sizer
    if (!this.visible) {
        return this;
    }

    // Clear childrenWidth/childrenHeight/childrenProportion of all sizers
    if (parent === undefined) {
        var children = this.getAllChildrenSizer([this]),
            child;
        for (var i = 0, cnt = children.length; i < cnt; i++) {
            child = children[i];
            child._childrenWidth = undefined;
            child._childrenHeight = undefined;
            child._childrenProportion = undefined;
        }
    }

    // Set size
    var childrenProportion = this.childrenProportion;
    if (this.orientation === 0) {
        // Width
        if (childrenProportion === 0) {
            this.width = this.childrenWidth;
        } else if (parent) {
            var padding = this.rexSizer.padding;
            this.width = parent.width - padding.left - padding.right;
        } else {
            this.width = this.childrenWidth;
        }

        // Height
        this.height = this.childrenHeight;

    } else {
        // Width
        this.width = this.childrenWidth;

        // Height
        if (childrenProportion === 0) {
            this.height = this.childrenHeight;
        } else if (parent) {
            var padding = this.rexSizer.padding;
            this.height = parent.height - padding.top - padding.bottom;
        } else {
            this.height = this.childrenHeight;
        }
    }

    var proportionLength;
    if ((childrenProportion > 0) && (parent !== undefined)) {
        var remainder;
        if (this.orientation === 0) {
            remainder = this.width - this.childrenWidth;
        } else {
            remainder = this.height - this.childrenHeight;
        }
        proportionLength = remainder / childrenProportion;
    } else {
        proportionLength = 0;
    }

    // Layout children    
    var children = this.getChildren();
    var child, childConfig, padding;
    var startX = this.x - (this.displayWidth * this.originX),
        startY = this.y - (this.displayHeight * this.originY);
    var itemX = startX,
        itemY = startY;
    var x, y, width, height; // Align zone
    for (var i = 0, cnt = children.length; i < cnt; i++) {
        child = children[i];
        if (!child.hasOwnProperty('rexSizer')) {
            continue;
        }
        // Skip invisible child
        if (!child.visible) {
            continue;
        }

        if (child.isRexSizer) {
            child.layout(this);
        }

        childConfig = child.rexSizer;
        padding = childConfig.padding;
        if (this.orientation === 0) {
            switch (childConfig.proportion) {
                case 0:
                    x = (itemX + padding.left);
                    width = child.width;
                    itemX += (width + padding.left + padding.right);
                    break;
                case -1:
                    x = (startX + padding.left);
                    width = this.width - padding.left - padding.right;
                    child.displayWidth = width;
                    break;
                default:
                    x = (itemX + padding.left);
                    width = (childConfig.proportion * proportionLength);
                    itemX += (width + padding.left + padding.right);
                    break;
            }
            y = (startY + padding.top);
            height = (this.height - padding.top - padding.bottom);
        } else {
            switch (childConfig.proportion) {
                case 0:
                    y = (itemY + padding.top);
                    height = child.height;
                    itemY += (height + padding.top + padding.bottom);
                    break;
                case -1:
                    y = (startY + padding.top);
                    height = this.height - padding.top - padding.bottom;
                    child.displayHeight = height;
                    break;
                default:
                    y = (itemY + padding.top);
                    height = (childConfig.proportion * proportionLength);
                    itemY += (height + padding.top + padding.bottom);
                    break;
            }
            x = (startX + padding.left);
            width = (this.width - padding.left - padding.right);
        }

        tmpZone.setPosition(x, y).setSize(width, height);
        AlignIn(child, tmpZone, childConfig.align);
        this.resetChildState(child)
    }
    return this;
}

var tmpZone = new Zone({
    sys: {
        queueDepthSort: NOOP,
        events: {
            once: NOOP
        }
    }
}, 0, 0, 1, 1);
tmpZone.setOrigin(0);

export default Layout;