// 工具函数
import fs from 'node:fs';
import path from 'node:path';
import { RuleStats, RuleGroup, SpecialRuleConfig } from './rule-types';
import { RuleConverter } from './rule-converter';
/**
 * 下载文件
 * @param url - 下载URL
 * @param dest - 目标路径
 */
export async function downloadFile(url: string, dest: string): Promise<void> {
  try {
    console.log(`Downloading ${url} to ${dest}`);
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const buffer = await response.arrayBuffer();
    await fs.promises.writeFile(dest, Buffer.from(buffer));
    console.log(`Downloaded: ${url}`);
  } catch (error) {
    console.error(`Download failed: ${url}`, error);
    throw error;
  }
}

/**
 * 确保目录存在
 * @param dirPath - 目录路径
 */
export function ensureDirectoryExists(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Created directory: ${dirPath}`);
  }
}

/**
 * 获取规则统计信息
 * @param content - 规则内容
 * @returns - 规则统计
 */
export function getRuleStats(content: string): RuleStats {
  const stats: RuleStats = {
    total: 0,
    domain: 0,
    domainSuffix: 0,
    domainKeyword: 0,
    ipCidr: 0,
    ipCidr6: 0,
    userAgent: 0,
    urlRegex: 0,
    other: 0
  };

  const lines = content.split('\n').filter(line => line.trim() && !line.startsWith('#'));
  stats.total = lines.length;

  lines.forEach(line => {
    const type = line.split(',')[0]?.trim().toUpperCase();
    switch (type) {
      case 'DOMAIN':
        stats.domain++;
        break;
      case 'DOMAIN-SUFFIX':
        stats.domainSuffix++;
        break;
      case 'DOMAIN-KEYWORD':
        stats.domainKeyword++;
        break;
      case 'IP-CIDR':
        stats.ipCidr++;
        break;
      case 'IP-CIDR6':
        stats.ipCidr6++;
        break;
      case 'USER-AGENT':
        stats.userAgent++;
        break;
      case 'URL-REGEX':
        stats.urlRegex++;
        break;
      default:
        stats.other++;
    }
  });

  return stats;
}

/**
 * 清理和排序规则
 * @param content - 规则内容
 * @param converter - 可选的规则转换器
 * @returns - 清理和排序后的规则
 */
export function cleanAndSort(content: string, converter?: RuleConverter): string {
  const lines = content.split('\n');
  const rules: string[] = [];

  lines.forEach(line => {
    line = line.trim();
    if (!line || line.startsWith('#')) return; // 跳过空行和注释行

    // 如果提供了转换器就使用转换器,否则直接使用原始规则
    const processedRule = converter ? converter.convert(line) : line;
    if (processedRule) {
      rules.push(processedRule);
    }
  });

  // 去重并排序规则
  const uniqueRules = [...new Set(rules)].sort();

  // 返回排序后的规则
  return uniqueRules.join('\n');
}

/**
 * 验证规则
 * @param rule - 规则
 * @returns - 是否有效
 */
export function validateRule(rule: string): boolean {
  const validRuleTypes = [
    'DOMAIN', 'DOMAIN-SUFFIX', 'DOMAIN-KEYWORD',
    'IP-CIDR', 'IP-CIDR6', 'GEOIP', 'URL-REGEX',
    'USER-AGENT', 'IP-ASN', 'AND', 'OR', 'NOT'
  ];
  
  const type = rule.split(',')[0]?.trim().toUpperCase();
  return validRuleTypes.includes(type);
}

/**
 * 初始化目录结构
 * @param repoPath - 仓库路径
 * @param ruleGroups - 规则组
 * @param specialRules - 特殊规则
 */
export function initializeDirectoryStructure(
  repoPath: string, 
  ruleGroups: RuleGroup[], 
  specialRules: SpecialRuleConfig[]
): void {
  // 从常规规则组收集目录
  const groupDirs = ruleGroups.flatMap(group => 
    group.files.map(file => path.dirname(file.path))
  );

  // 从特殊规则收集目录
  const specialDirs = specialRules.map(rule => 
    path.dirname(rule.targetFile)
  );

  // 合并所有目录并去重
  const allDirs = [...new Set([...groupDirs, ...specialDirs])];

  // 创建目录
  for (const dir of allDirs) {
    const fullPath = path.join(repoPath, dir);
    ensureDirectoryExists(fullPath);
  }
}

/**
 * 生成无解析版本
 * @param content - 规则内容
 * @returns - 无解析版本
 */
export function generateNoResolveVersion(content: string): string {
  return content
    .split('\n')
    .map(line => {
      if (line.startsWith('IP-CIDR') && !line.includes('no-resolve')) {
        return `${line},no-resolve`;
      }
      return line;
    })
    .join('\n');
}

interface HeaderInfo {
  title?: string;
  description?: string;
  url?: string;
}

/**
 * 添加规则文件头部注释
 * @param content - 规则内容
 * @param info - 头部信息
 * @param sourceUrls - 源文件URLs（用于合并规则）
 */
export function addRuleHeader(content: string, info?: HeaderInfo, sourceUrls?: string[]): string {
  const stats = getRuleStats(content);
  const timestamp = new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });
  
  // 收集所有有效的 URLs
  const sources = [
    info?.url,           // 单个规则的 URL
    ...(sourceUrls || []) // 合并规则的源文件 URLs
  ].filter(Boolean); // 过滤掉空值
  
  const headers = [
    '#',
    // 只有在有 title 时才添加
    info?.title && `# ${info.title}`,
    '#',
    `# Last Updated: ${timestamp}`,
    '#',
    '# 规则统计:',
    stats.domain > 0 && `# DOMAIN: ${stats.domain}`,
    stats.domainSuffix > 0 && `# DOMAIN-SUFFIX: ${stats.domainSuffix}`,
    stats.domainKeyword > 0 && `# DOMAIN-KEYWORD: ${stats.domainKeyword}`,
    stats.ipCidr > 0 && `# IP-CIDR: ${stats.ipCidr}`,
    stats.ipCidr6 > 0 && `# IP-CIDR6: ${stats.ipCidr6}`,
    stats.userAgent > 0 && `# USER-AGENT: ${stats.userAgent}`,
    stats.urlRegex > 0 && `# URL-REGEX: ${stats.urlRegex}`,
    stats.other > 0 && `# OTHER: ${stats.other}`,
    `# TOTAL: ${stats.total}`,
    '#',
    // 只有在有 description 时才添加
    info?.description && `# ${info.description}`,
    '#',
    // 只有在有 sources 时才添加数据来源部分
    sources.length > 0 && [
      '# Data from:',
      ...sources.map(source => `#  - ${source}`)
    ],
    '',
    content
  ].flat().filter(Boolean);

  return headers.join('\n');
}