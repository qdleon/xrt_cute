import {
  AlertCircle,
  Check,
  CheckCircle2,
  Clock,
  Cloud,
  Copy,
  Download,
  Eye,
  EyeOff,
  FileSpreadsheet,
  KeyRound,
  Lock,
  RefreshCw,
  ShieldCheck,
  Trash2,
  Upload,
  X
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useProject } from '../../context/ProjectContext';
import {
  computeChecksum,
  decryptWithPassphrase,
  EncryptedVaultBundle,
  encryptWithPassphrase,
  exportToCSV,
} from '../../utils/crypto';

interface CloudVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'backup' | 'restore' | 'export' | 'history';
}

interface CloudSnapshotMeta {
  id: string;
  name: string;
  timestamp: string;
  itemCount: number;
  checksum: string;
}

export const CloudVaultModal: React.FC<CloudVaultModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'backup',
}) => {
  const { issues, projects, cycles, members, activities, importDataJSON } = useProject();

  const [activeTab, setActiveTab] = useState<'backup' | 'restore' | 'export' | 'history'>(defaultTab);
  const [passphrase, setPassphrase] = useState('ApexVault2026!');
  const [showPassphrase, setShowPassphrase] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Cloud snapshots list
  const [snapshots, setSnapshots] = useState<CloudSnapshotMeta[]>([]);
  const [selectedSnapshotId, setSelectedSnapshotId] = useState<string>('');

  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab, isOpen]);

  useEffect(() => {
    if (isOpen) {
      fetchSnapshots();
    }
  }, [isOpen]);

  const fetchSnapshots = async () => {
    try {
      const res = await fetch('/api/cloud-backup/list');
      if (res.ok) {
        const data = await res.json();
        setSnapshots(data);
        if (data.length > 0 && !selectedSnapshotId) {
          setSelectedSnapshotId(data[0].id);
        }
      }
    } catch (e) {
      console.error('Failed to fetch cloud snapshots', e);
    }
  };

  if (!isOpen) return null;

  // Execute Encrypted Backup to Cloud
  const handleCloudBackup = async () => {
    if (!passphrase.trim()) {
      setStatusMessage({ type: 'error', text: '请输入加密主密码' });
      return;
    }

    try {
      setIsProcessing(true);
      setStatusMessage(null);

      const payloadPlaintext = JSON.stringify({
        issues,
        projects,
        cycles,
        members,
        activities,
        exportedAt: new Date().toISOString(),
      });

      // Encrypt client-side using AES-256-GCM
      const encryptedBundle = await encryptWithPassphrase(
        payloadPlaintext,
        passphrase,
        issues.length
      );

      // Post encrypted payload to cloud server API
      const res = await fetch('/api/cloud-backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          encryptedPayload: encryptedBundle.cipherText,
          iv: encryptedBundle.iv,
          salt: encryptedBundle.salt,
          itemCount: encryptedBundle.itemCount,
          checksum: encryptedBundle.checksum,
          name: `台账云备份 (${issues.length}项事项)`,
        }),
      });

      if (!res.ok) throw new Error('云端服务器存储失败');

      const data = await res.json();
      setStatusMessage({
        type: 'success',
        text: `已完成端到端 AES-256-GCM 强加密并同步至云端！校验和：${encryptedBundle.checksum.slice(0, 16)}...`,
      });

      // Refresh snapshots
      fetchSnapshots();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || '备份失败' });
    } finally {
      setIsProcessing(false);
    }
  };

  // Download Encrypted File
  const handleDownloadEncryptedFile = async () => {
    if (!passphrase.trim()) {
      setStatusMessage({ type: 'error', text: '请输入加密主密码' });
      return;
    }

    try {
      setIsProcessing(true);
      const payloadPlaintext = JSON.stringify({
        issues,
        projects,
        cycles,
        members,
        activities,
        exportedAt: new Date().toISOString(),
      });

      const encryptedBundle = await encryptWithPassphrase(
        payloadPlaintext,
        passphrase,
        issues.length
      );

      const blob = new Blob([JSON.stringify(encryptedBundle, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `待办台账_加密备份_${new Date().toISOString().slice(0, 10)}.afenc`;
      a.click();
      URL.revokeObjectURL(url);

      setStatusMessage({
        type: 'success',
        text: '加密备份文件 (.afenc) 已下载，数据已由 AES-256-GCM 锁定！',
      });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || '导出失败' });
    } finally {
      setIsProcessing(false);
    }
  };

  // Restore from Cloud
  const handleRestoreFromCloud = async (snapshotId?: string) => {
    if (!passphrase.trim()) {
      setStatusMessage({ type: 'error', text: '请输入解密主密码' });
      return;
    }

    try {
      setIsProcessing(true);
      setStatusMessage(null);

      const targetId = snapshotId || selectedSnapshotId;
      const endpoint = targetId
        ? `/api/cloud-backup/${targetId}`
        : '/api/cloud-backup/latest';

      const res = await fetch(endpoint);
      if (!res.ok) throw new Error('未找到该云端备份或服务器请求异常');

      const record = await res.json();
      const bundle: EncryptedVaultBundle = {
        version: '1.0-aes256gcm',
        cipherText: record.encryptedPayload,
        iv: record.iv,
        salt: record.salt,
        checksum: record.checksum,
        timestamp: record.timestamp,
        itemCount: record.itemCount,
      };

      // Client-side decrypt
      const decryptedPlaintext = await decryptWithPassphrase(bundle, passphrase);
      const success = importDataJSON(decryptedPlaintext);

      if (success) {
        setStatusMessage({
          type: 'success',
          text: `云端数据已成功解密并恢复！共载入 ${record.itemCount || '全部'} 项事项。`,
        });
      } else {
        throw new Error('解密后的数据格式不正确');
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || '恢复失败：密码错误或数据校验异常' });
    } finally {
      setIsProcessing(false);
    }
  };

  // Upload and decrypt local .afenc file
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async event => {
      try {
        const content = event.target?.result as string;
        const bundle: EncryptedVaultBundle = JSON.parse(content);
        const decryptedPlaintext = await decryptWithPassphrase(bundle, passphrase);
        const success = importDataJSON(decryptedPlaintext);

        if (success) {
          setStatusMessage({
            type: 'success',
            text: '已成功从本地加密文件解密并恢复全部台账数据！',
          });
        }
      } catch (err: any) {
        setStatusMessage({
          type: 'error',
          text: err.message || '解密失败：请确认主密码正确且文件格式完整',
        });
      }
    };
    reader.readAsText(file);
  };

  // Delete a snapshot
  const handleDeleteSnapshot = async (id: string) => {
    if (!confirm('确认从云端删除此加密快照备份？')) return;
    try {
      await fetch(`/api/cloud-backup/${id}`, { method: 'DELETE' });
      fetchSnapshots();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white dark:bg-[#0c111a] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 dark:from-slate-900 dark:to-indigo-950/40 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>云端保险箱 · 数据安全中心</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  AES-256-GCM
                </span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                端到端军工级加密 · 云端存储 · 防篡改哈希校验
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="px-6 pt-3 border-b border-slate-200 dark:border-slate-800 flex items-center gap-4 bg-slate-50/50 dark:bg-slate-900/40 text-xs font-medium">
          <button
            onClick={() => {
              setActiveTab('backup');
              setStatusMessage(null);
            }}
            className={`pb-2.5 transition-colors border-b-2 flex items-center gap-1.5 ${
              activeTab === 'backup'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Cloud className="w-3.5 h-3.5" />
            <span>云端同步备份</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('restore');
              setStatusMessage(null);
            }}
            className={`pb-2.5 transition-colors border-b-2 flex items-center gap-1.5 ${
              activeTab === 'restore'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>云端解密恢复</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('export');
              setStatusMessage(null);
            }}
            className={`pb-2.5 transition-colors border-b-2 flex items-center gap-1.5 ${
              activeTab === 'export'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>数据导出 (CSV/密文)</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('history');
              setStatusMessage(null);
            }}
            className={`pb-2.5 transition-colors border-b-2 flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>快照历史 ({snapshots.length})</span>
          </button>
        </div>

        {/* Passphrase Global Box */}
        <div className="px-6 pt-4 pb-1">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-indigo-500" />
                <span>加密主密码 (用于客户端 AES 密钥派生)</span>
              </label>
              <button
                type="button"
                onClick={() => setShowPassphrase(p => !p)}
                className="text-[11px] text-indigo-600 dark:text-indigo-400 flex items-center gap-1 hover:underline"
              >
                {showPassphrase ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                <span>{showPassphrase ? '隐藏' : '显示'}</span>
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassphrase ? 'text' : 'password'}
                value={passphrase}
                onChange={e => setPassphrase(e.target.value)}
                placeholder="设置并牢记主密码..."
                className="w-full px-3 py-1.5 font-mono text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <p className="text-[11px] text-slate-400">
              采用 PBKDF2 (100,000 次哈希迭代) 生成 256 位密钥，服务端仅存密文，无主密码无法解密。
            </p>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto max-h-[380px] space-y-4">
          {statusMessage && (
            <div
              className={`p-3 rounded-lg text-xs flex items-start gap-2 ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                  : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              )}
              <div className="break-all leading-relaxed">{statusMessage.text}</div>
            </div>
          )}

          {/* Tab 1: Backup */}
          {activeTab === 'backup' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/40 bg-indigo-50/40 dark:bg-indigo-950/20 space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-indigo-900 dark:text-indigo-300">
                  <Lock className="w-4 h-4" />
                  <span>准备同步 {issues.length} 项事项至云端加密保险箱</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  点击下方按钮后，您的待办事项、项目分类与排期数据将在浏览器本地瞬间完成 AES-256-GCM 强加密，并生成防篡改 SHA-256 数字校验和后上传至云端服务器持久化保存。
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleCloudBackup}
                  disabled={isProcessing}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 transition-colors shadow-sm"
                >
                  <Cloud className="w-4 h-4" />
                  <span>{isProcessing ? '正在加密同步...' : '一键加密并同步至云端'}</span>
                </button>

                <button
                  onClick={handleDownloadEncryptedFile}
                  disabled={isProcessing}
                  className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
                  title="下载离线加密密文备份文件"
                >
                  <Download className="w-4 h-4" />
                  <span>下载加密文件 (.afenc)</span>
                </button>
              </div>
            </div>
          )}

          {/* Tab 2: Restore */}
          {activeTab === 'restore' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  选择要恢复的云端快照
                </label>
                {snapshots.length > 0 ? (
                  <select
                    value={selectedSnapshotId}
                    onChange={e => setSelectedSnapshotId(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  >
                    {snapshots.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.itemCount} 项事项) · {new Date(s.timestamp).toLocaleString()}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-xs text-slate-400 p-2 border rounded-lg bg-slate-50 dark:bg-slate-900">
                    云端暂无备份快照，请先执行「云端同步备份」或导入离线加密文件。
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleRestoreFromCloud()}
                  disabled={isProcessing || snapshots.length === 0}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 transition-colors shadow-sm"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>从所选云端快照解密恢复</span>
                </button>
              </div>

              {/* Local File upload */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  或者：从本地加密文件 (.afenc / .json) 恢复
                </label>
                <input
                  type="file"
                  accept=".afenc,.json,.txt"
                  onChange={handleFileUpload}
                  className="text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-100 dark:file:bg-slate-800 file:text-slate-700 dark:file:text-slate-200 hover:file:bg-slate-200"
                />
              </div>
            </div>
          )}

          {/* Tab 3: Export Options */}
          {activeTab === 'export' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                      <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                      <span>导出 CSV 台账明细表</span>
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      导出支持 Excel / WPS 打开的标准 UTF-8 带 BOM 格式表格，包含编号、标题、分类、工时及截止期。
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      exportToCSV(issues, `待办台账_导出_${new Date().toISOString().slice(0, 10)}.csv`);
                      setStatusMessage({ type: 'success', text: 'CSV 台账文件导出已完成！' });
                    }}
                    className="px-3.5 py-1.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-xs"
                  >
                    下载 CSV
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                      <Lock className="w-4 h-4 text-indigo-600" />
                      <span>导出 AES-256 加密备份卷</span>
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      完整加密包含项目、迭代、事项与操作日志的端到端密文文件，适合离线永久归档。
                    </p>
                  </div>
                  <button
                    onClick={handleDownloadEncryptedFile}
                    className="px-3.5 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-xs"
                  >
                    下载加密卷
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Snapshots History */}
          {activeTab === 'history' && (
            <div className="space-y-3">
              {snapshots.length > 0 ? (
                <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900">
                  {snapshots.map(s => (
                    <div
                      key={s.id}
                      className="p-3.5 flex items-center justify-between gap-3 text-xs hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <Cloud className="w-4 h-4 text-indigo-500 shrink-0" />
                          <span className="font-semibold text-slate-900 dark:text-white">
                            {s.name}
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 bg-slate-100 dark:bg-slate-800 rounded text-slate-500">
                            {s.itemCount} 项
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5 ml-6">
                          时间：{new Date(s.timestamp).toLocaleString()} · SHA-256: {s.checksum.slice(0, 12)}...
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleRestoreFromCloud(s.id)}
                          className="px-2.5 py-1 text-xs text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded transition-colors"
                        >
                          还原
                        </button>
                        <button
                          onClick={() => handleDeleteSnapshot(s.id)}
                          className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                          title="删除快照"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-slate-400 border border-dashed rounded-xl">
                  暂无云端历史快照。
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <Lock className="w-3 h-3 text-emerald-500" />
            <span>端到端零知识加密保护，隐私数据永不裸传</span>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-md transition-colors"
          >
            完成
          </button>
        </div>
      </div>
    </div>
  );
};
