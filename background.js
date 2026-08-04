/**
 * Studocu Tool
 * Tác giả: HPahm
 *
 * File này chạy ngầm trong extension, có nhiệm vụ:
 * - Nhận lệnh xóa cookie từ popup khi người dùng bấm nút Bypass
 * - Duyệt tất cả cookie trong trình duyệt
 * - Chỉ xóa cookie của Studocu (studocu.com và studocu.vn)
 * - Không đụng đến cookie của bất kỳ website nào khác
 */

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.action === 'clearCookies') {
        (async () => {
            try {
                // lấy toàn bộ cookie hiện có trong trình duyệt
                const allCookies = await chrome.cookies.getAll({});
                let count = 0;
                for (const cookie of allCookies) {
                    const domain = cookie.domain;
                    // kiểm tra kỹ: chỉ xóa nếu là domain của Studocu
                    const isStudocu = domain === 'studocu.com'
                        || domain === 'studocu.vn'
                        || domain.endsWith('.studocu.com')
                        || domain.endsWith('.studocu.vn');
                    // không phải Studocu thì bỏ qua
                    if (!isStudocu) continue;
                    // xử lý domain (bỏ dấu chấm đầu nếu có)
                    const cleanDomain = domain.startsWith('.') ? domain.substring(1) : domain;
                    const protocol = cookie.secure ? 'https:' : 'http:';
                    const urlCookie = `${protocol}//${cleanDomain}${cookie.path}`;
                    // Thực hiện xóa cookie
                    await chrome.cookies.remove({
                        url: urlCookie,
                        name: cookie.name,
                        storeId: cookie.storeId
                    });
                    count++;
                }
                // báo kết quả về popup để hiển thị cho người dùng
                sendResponse({ success: true, count });
            } catch (e) {
                sendResponse({ success: false, error: e.message });
            }
        })();
        return true;
    }
});