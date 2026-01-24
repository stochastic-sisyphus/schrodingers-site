/**
 * Code structure analysis for D3 visualizations
 * Analyzes repository file structure and builds graph data
 */

import type { FileNode } from '../types';

export interface GraphNode {
  id: string;
  label: string;
  size: number;
  type: 'file' | 'dir';
  language?: string;
  group: string;
}

export interface GraphEdge {
  source: string;
  target: string;
  weight: number;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface TreeNode {
  name: string;
  value?: number;
  children?: TreeNode[];
  language?: string;
  path: string;
}

/**
 * Build dependency graph from file structure
 */
export function buildDependencyGraph(files: FileNode[]): GraphData {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  const directories = new Map<string, Set<string>>();

  // Extract directory structure
  files.forEach(file => {
    const parts = file.path.split('/');

    if (parts.length > 1) {
      const dir = parts.slice(0, -1).join('/');
      if (!directories.has(dir)) {
        directories.set(dir, new Set());
      }
      directories.get(dir)!.add(file.path);
    }
  });

  // Create nodes for top-level directories and important files
  const topLevelDirs = new Set<string>();
  files.forEach(file => {
    const parts = file.path.split('/');
    if (parts.length > 0) {
      topLevelDirs.add(parts[0]);
    }
  });

  // Add directory nodes
  topLevelDirs.forEach(dir => {
    const filesInDir = files.filter(f => f.path.startsWith(dir + '/'));
    const totalSize = filesInDir.reduce((sum, f) => sum + f.size, 0);

    nodes.push({
      id: dir,
      label: dir,
      size: Math.log(totalSize + 1) * 10,
      type: 'dir',
      group: dir,
    });
  });

  // Add important file nodes (limit to prevent overcrowding)
  const importantFiles = files
    .filter(f => {
      // Include config files, entry points, and larger files
      const fileName = f.path.split('/').pop() || '';
      return (
        fileName.includes('config') ||
        fileName.includes('index') ||
        fileName.includes('main') ||
        fileName.includes('app') ||
        f.size > 5000
      );
    })
    .slice(0, 30);

  importantFiles.forEach(file => {
    const parts = file.path.split('/');
    const dir = parts.length > 1 ? parts[0] : 'root';

    nodes.push({
      id: file.path,
      label: parts[parts.length - 1],
      size: Math.log(file.size + 1) * 3,
      type: 'file',
      language: file.language,
      group: dir,
    });

    // Add edge from directory to file
    if (dir !== 'root' && topLevelDirs.has(dir)) {
      edges.push({
        source: dir,
        target: file.path,
        weight: 1,
      });
    }
  });

  // Create edges between related directories based on file relationships
  const dirArray = Array.from(topLevelDirs);
  for (let i = 0; i < dirArray.length; i++) {
    for (let j = i + 1; j < dirArray.length; j++) {
      // Simple heuristic: directories are related if they share file types
      const dir1Files = files.filter(f => f.path.startsWith(dirArray[i] + '/'));
      const dir2Files = files.filter(f => f.path.startsWith(dirArray[j] + '/'));

      const dir1Languages = new Set(dir1Files.map(f => f.language).filter(Boolean));
      const dir2Languages = new Set(dir2Files.map(f => f.language).filter(Boolean));

      const commonLanguages = Array.from(dir1Languages).filter(l => dir2Languages.has(l));

      if (commonLanguages.length > 0) {
        edges.push({
          source: dirArray[i],
          target: dirArray[j],
          weight: commonLanguages.length,
        });
      }
    }
  }

  return { nodes, edges };
}

/**
 * Build hierarchical tree structure
 */
export function buildFileTree(files: FileNode[]): TreeNode {
  const root: TreeNode = {
    name: 'root',
    children: [],
    path: '',
  };

  // Limit to important directories and files
  const filteredFiles = files.filter(f => {
    // Exclude common noise directories
    const excludeDirs = ['node_modules', '.git', 'dist', 'build', '.next', '.cache'];
    return !excludeDirs.some(dir => f.path.includes(dir));
  });

  // Group by top-level directory
  const grouped = new Map<string, FileNode[]>();
  filteredFiles.forEach(file => {
    const parts = file.path.split('/');
    const topLevel = parts[0];

    if (!grouped.has(topLevel)) {
      grouped.set(topLevel, []);
    }
    grouped.get(topLevel)!.push(file);
  });

  // Build tree (limit depth to prevent overcrowding)
  grouped.forEach((filesInDir, dirName) => {
    const dirNode: TreeNode = {
      name: dirName,
      path: dirName,
      children: [],
    };

    // Group files by subdirectory
    const subDirs = new Map<string, FileNode[]>();
    const topLevelFiles: FileNode[] = [];

    filesInDir.forEach(file => {
      const relativePath = file.path.substring(dirName.length + 1);
      const parts = relativePath.split('/');

      if (parts.length === 1) {
        topLevelFiles.push(file);
      } else {
        const subDir = parts[0];
        if (!subDirs.has(subDir)) {
          subDirs.set(subDir, []);
        }
        subDirs.get(subDir)!.push(file);
      }
    });

    // Add subdirectories (limit to top 5 by file count)
    const sortedSubDirs = Array.from(subDirs.entries())
      .sort((a, b) => b[1].length - a[1].length)
      .slice(0, 5);

    sortedSubDirs.forEach(([subDirName, subFiles]) => {
      const totalSize = subFiles.reduce((sum, f) => sum + f.size, 0);
      dirNode.children!.push({
        name: subDirName,
        value: totalSize,
        path: `${dirName}/${subDirName}`,
        children: subFiles.slice(0, 10).map(f => ({
          name: f.path.split('/').pop()!,
          value: f.size,
          language: f.language,
          path: f.path,
        })),
      });
    });

    // Add top-level files (limit to 10)
    topLevelFiles.slice(0, 10).forEach(file => {
      dirNode.children!.push({
        name: file.path.split('/').pop()!,
        value: file.size,
        language: file.language,
        path: file.path,
      });
    });

    root.children!.push(dirNode);
  });

  return root;
}

/**
 * Calculate file metrics for visualization
 */
export function calculateFileMetrics(files: FileNode[]) {
  const languageStats = new Map<string, { count: number; totalSize: number }>();
  let totalSize = 0;

  files.forEach(file => {
    totalSize += file.size;

    if (file.language) {
      const stats = languageStats.get(file.language) || { count: 0, totalSize: 0 };
      stats.count++;
      stats.totalSize += file.size;
      languageStats.set(file.language, stats);
    }
  });

  const languageDistribution = Array.from(languageStats.entries())
    .map(([language, stats]) => ({
      language,
      count: stats.count,
      size: stats.totalSize,
      percentage: (stats.totalSize / totalSize) * 100,
    }))
    .sort((a, b) => b.size - a.size);

  return {
    totalFiles: files.length,
    totalSize,
    languageDistribution,
    averageFileSize: totalSize / files.length,
  };
}

/**
 * Analyze repository structure from files
 */
export function analyzeRepoStructure(files: FileNode[]) {
  const graph = buildDependencyGraph(files);
  const tree = buildFileTree(files);
  const metrics = calculateFileMetrics(files);

  return {
    graph,
    tree,
    metrics,
  };
}
