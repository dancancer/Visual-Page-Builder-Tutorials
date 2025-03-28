import { ComponentConfig } from '../common/types';

export function deleteNodeAndChildren(tree: Array<ComponentConfig | undefined>, nodeId: number) {
  // 创建一个 Set 用于存储所有需要删除的节点 ID
  const idsToDelete = new Set();

  // 辅助函数递归找到所有子节点
  function collectChildren(nodeId: number) {
    idsToDelete.add(nodeId);
    tree.forEach((node) => {
      if (node?.parentId === nodeId) {
        if (node.id !== undefined) {
          collectChildren(node.id); // 递归收集子节点
        }
      }
    });
  }

  // 收集目标节点及其所有子节点
  collectChildren(nodeId);

  // 需要删除的节点置空
  return tree.map((node) => {
    if (idsToDelete.has(node?.id)) {
      return undefined;
    }
    return node;
  });
}
