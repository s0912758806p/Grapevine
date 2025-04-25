/**
 * 認證橋接器 - 處理認證相關的功能
 */

/**
 * 空的通知函數 - Utterances 不需要顯式通知
 * 由於 Utterances 依賴 GitHub 原生認證，所以不需要額外處理
 * 保留此函數以維持 API 兼容性
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const notifyGiscusAboutLogin = (_token: string) => {
  console.log("GitHub 登錄成功 - Utterances 將自動使用 GitHub 認證");
  // Utterances 會自動使用 GitHub 認證，不需要額外處理
};

/**
 * 空的登出通知函數
 * 保留此函數以維持 API 兼容性
 */
export const notifyGiscusAboutLogout = () => {
  console.log("用戶已登出 - Utterances 將自動處理");
  // Utterances 會自動檢測登出狀態，不需要額外處理
};
