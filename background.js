// Background - Chỉ xóa cookie của Studocu, không đụng web khác

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.action === 'clearCookies') {
        (async () => {
            try {
                const allCookies = await chrome.cookies.getAll({});
                let count = 0;
                for (const cookie of allCookies) {
                    // CHỈ xóa nếu domain KẾT THÚC bằng studocu.com hoặc studocu.vn
                    const domain = cookie.domain;
                    const isStudocu = domain === 'studocu.com'
                        || domain === 'studocu.vn'
                        || domain.endsWith('.studocu.com')
                        || domain.endsWith('.studocu.vn');

                    if (!isStudocu) continue;

                    const cleanDomain = domain.startsWith('.') ? domain.substring(1) : domain;
                    const protocol = cookie.secure ? "https:" : "http:";
                    const urlCookie = `${protocol}//${cleanDomain}${cookie.path}`;
                    await chrome.cookies.remove({ url: urlCookie, name: cookie.name, storeId: cookie.storeId });
                    count++;
                }
                sendResponse({ success: true, count });
            } catch (e) {
                sendResponse({ success: false, error: e.message });
            }
        })();
        return true;
    }
});
