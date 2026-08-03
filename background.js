// Background - Xử lý clearCookies message từ popup

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.action === 'clearCookies') {
        (async () => {
            try {
                const allCookies = await chrome.cookies.getAll({});
                let count = 0;
                for (const cookie of allCookies) {
                    if (cookie.domain.includes('studocu')) {
                        const cleanDomain = cookie.domain.startsWith('.') ? cookie.domain.substring(1) : cookie.domain;
                        const protocol = cookie.secure ? "https:" : "http:";
                        const urlCookie = `${protocol}//${cleanDomain}${cookie.path}`;
                        await chrome.cookies.remove({ url: urlCookie, name: cookie.name, storeId: cookie.storeId });
                        count++;
                    }
                }
                sendResponse({ success: true, count });
            } catch (e) {
                sendResponse({ success: false, error: e.message });
            }
        })();
        return true;
    }
});
