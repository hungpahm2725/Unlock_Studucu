/**
 * Studocu Tool - Popup Logic
 * Tác giả: HPahm
 *
 * File này điều khiển giao diện popup khi người dùng click vào icon extension.
 * Có 2 chức năng chính:
 * - Bypass khóa & mờ: gửi lệnh xóa cookie Studocu rồi reload trang
 * - Tạo file PDF: clone nội dung tài liệu và mở hộp thoại in
 */

//  cập nhật trạng thái hiển thị 
function updateStatus(msg, processing = false) {
  const bar = document.getElementById('status');
  const text = document.getElementById('status-text');
  if (bar) bar.classList.toggle('processing', processing);
  if (text) text.textContent = msg;
}

//  BYPASS - Xóa cookie + reload 
document.getElementById('clearBtn').addEventListener('click', async () => {
  updateStatus('Đang xóa cookie...', true);
  try {
    // gửi lệnh xóa cookie đến background.js
    const res = await chrome.runtime.sendMessage({ action: 'clearCookies' });
    if (res.success) {
      updateStatus(`Đã xóa ${res.count} cookies! Đang reload...`, true);
      setTimeout(async () => {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab) await chrome.tabs.reload(tab.id);
        updateStatus('Hoàn tất!');
        setTimeout(() => updateStatus('Sẵn sàng'), 2000);
      }, 800);
    } else {
      updateStatus('Lỗi: ' + (res.error || 'Không rõ'));
    }
  } catch (e) {
    updateStatus('Lỗi: ' + e.message);
  }
});

//  PDF tạo file PDF
document.getElementById('checkBtn').addEventListener('click', async () => {
  updateStatus('Đang tạo PDF...', true);
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab) {
      updateStatus('Không tìm thấy tab');
      return;
    }
    // inject CSS cho giao diện in
    await chrome.scripting.insertCSS({
      target: { tabId: tab.id },
      files: ['viewer_styles.css']
    });
    // inject script tạo PDF vào trang Studocu
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: runCleanViewer
    });
    updateStatus('Đã mở hộp thoại in!');
    setTimeout(() => updateStatus('Sẵn sàng'), 3000);
  } catch (e) {
    updateStatus('Lỗi: ' + e.message);
  }
});
//  PDF creator chạy trực tiếp trong trang Studocu
// hàm này được inject vào trang web, không chạy trong popup
function runCleanViewer() {
  // tìm tất cả các trang tài liệu 
  const pages = document.querySelectorAll('div[data-page-index]');

  if (pages.length === 0) {
    alert('Không tìm thấy trang nào!\n\nHãy cuộn chuột xuống cuối tài liệu để web tải hết nội dung trước!');
    return;
  }
  if (!confirm('Tìm thấy ' + pages.length + ' trang.\nBấm OK để tạo PDF...')) return;
  const SCALE_FACTOR = 4;
  const HEIGHT_SCALE_DIVISOR = 4;
  // copy style từ element gốc sang element mới
  function copyComputedStyle(source, target, scale, shouldScaleHeight, shouldScaleWidth) {
    const computedStyle = window.getComputedStyle(source);
    const normalProps = [
      'position', 'left', 'top', 'bottom', 'right',
      'font-family', 'font-weight', 'font-style',
      'color', 'background-color',
      'text-align', 'white-space',
      'display', 'visibility', 'opacity', 'z-index',
      'text-shadow', 'unicode-bidi', 'font-feature-settings', 'padding'
    ];
    let styleString = '';

    normalProps.forEach(prop => {
      const value = computedStyle.getPropertyValue(prop);
      if (value && value !== 'none' && value !== 'auto' && value !== 'normal') {
        styleString += prop + ': ' + value + ' !important; ';
      }
    });
    // xử lý width
    const widthValue = computedStyle.getPropertyValue('width');
    if (widthValue && widthValue !== 'none' && widthValue !== 'auto') {
      if (shouldScaleWidth) {
        const numValue = parseFloat(widthValue);
        if (!isNaN(numValue) && numValue > 0) {
          const unit = widthValue.replace(numValue.toString(), '');
          styleString += 'width: ' + (numValue / 4) + unit + ' !important; ';
        } else {
          styleString += 'width: ' + widthValue + ' !important; ';
        }
      } else {
        styleString += 'width: ' + widthValue + ' !important; ';
      }
    }
    // xử lý height
    const heightValue = computedStyle.getPropertyValue('height');
    if (heightValue && heightValue !== 'none' && heightValue !== 'auto') {
      if (shouldScaleHeight) {
        const numValue = parseFloat(heightValue);
        if (!isNaN(numValue) && numValue > 0) {
          const unit = heightValue.replace(numValue.toString(), '');
          styleString += 'height: ' + (numValue / HEIGHT_SCALE_DIVISOR) + unit + ' !important; ';
        } else {
          styleString += 'height: ' + heightValue + ' !important; ';
        }
      } else {
        styleString += 'height: ' + heightValue + ' !important; ';
      }
    }
    // xử lý margin
    ['margin-top', 'margin-right', 'margin-bottom', 'margin-left'].forEach(prop => {
      const value = computedStyle.getPropertyValue(prop);
      if (value && value !== 'auto') {
        const numValue = parseFloat(value);
        if (!isNaN(numValue)) {
          if (source.tagName === 'SPAN' && source.classList && source.classList.contains('_') && numValue !== 0) {
            const unit = value.replace(numValue.toString(), '');
            styleString += prop + ': ' + (numValue / scale) + unit + ' !important; ';
          } else {
            styleString += prop + ': ' + value + ' !important; ';
          }
        }
      }
    });
    // xử lý font-size và line-height
    ['font-size', 'line-height'].forEach(prop => {
      const value = computedStyle.getPropertyValue(prop);
      if (value && value !== 'none' && value !== 'auto' && value !== 'normal') {
        const numValue = parseFloat(value);
        if (!isNaN(numValue) && numValue !== 0) {
          const unit = value.replace(numValue.toString(), '');
          styleString += prop + ': ' + (numValue / scale) + unit + ' !important; ';
        } else {
          styleString += prop + ': ' + value + ' !important; ';
        }
      }
    });
    // xử lý transform-origin
    const transformOrigin = computedStyle.getPropertyValue('transform-origin');
    if (transformOrigin) {
      styleString += 'transform-origin: ' + transformOrigin + ' !important; ';
    }
    styleString += 'overflow: visible !important; max-width: none !important; max-height: none !important; clip: auto !important; clip-path: none !important; ';
    target.style.cssText += styleString;
  }
  // deep clone element kèm theo style
  function deepCloneWithStyles(element, scale, heightScale) {
    const clone = element.cloneNode(false);
    const hasTextClass = element.classList && element.classList.contains('t');
    const hasUnderscoreClass = element.classList && element.classList.contains('_');

    copyComputedStyle(element, clone, scale, hasTextClass, hasUnderscoreClass);

    if (element.classList && element.classList.contains('pc')) {
      clone.style.setProperty('transform', 'none', 'important');
      clone.style.setProperty('overflow', 'visible', 'important');
      clone.style.setProperty('max-width', 'none', 'important');
      clone.style.setProperty('max-height', 'none', 'important');
    }

    if (element.childNodes.length === 1 && element.childNodes[0].nodeType === 3) {
      clone.textContent = element.textContent;
    } else {
      element.childNodes.forEach(child => {
        if (child.nodeType === 1) {
          clone.appendChild(deepCloneWithStyles(child, scale, heightScale));
        } else if (child.nodeType === 3) {
          clone.appendChild(child.cloneNode(true));
        }
      });
    }
    return clone;
  }
  // tạo container cho bản in
  const fragment = document.createDocumentFragment();
  const viewerContainer = document.createElement('div');
  viewerContainer.id = 'clean-viewer-container';

  // xử lý từng trang
  pages.forEach((page, index) => {
    const pc = page.querySelector('.pc');
    let width = 595.3;
    let height = 841.9;
    if (pc) {
      const pcStyle = window.getComputedStyle(pc);
      const pw = parseFloat(pcStyle.width);
      const ph = parseFloat(pcStyle.height);
      if (!isNaN(pw) && pw > 0 && !isNaN(ph) && ph > 0) {
        width = pw;
        height = ph;
      } else {
        const rect = pc.getBoundingClientRect();
        if (rect.width > 10 && rect.height > 10) {
          width = rect.width;
          height = rect.height;
        }
      }
    }
    // tạo page mới
    const newPage = document.createElement('div');
    newPage.className = 'std-page';
    newPage.id = 'page-' + (index + 1);
    newPage.setAttribute('data-page-number', index + 1);
    newPage.style.width = width + 'px';
    newPage.style.height = height + 'px';
    // layer ảnh nền
    const originalImg = page.querySelector('img.bi') || page.querySelector('img');
    if (originalImg) {
      const bgLayer = document.createElement('div');
      bgLayer.className = 'layer-bg';
      const imgClone = originalImg.cloneNode(true);
      imgClone.style.cssText = 'width: 100%; height: 100%; object-fit: cover; object-position: top center';
      bgLayer.appendChild(imgClone);
      newPage.appendChild(bgLayer);
    }
    // layer text
    const originalPc = page.querySelector('.pc');
    if (originalPc) {
      const textLayer = document.createElement('div');
      textLayer.className = 'layer-text';
      const pcClone = deepCloneWithStyles(originalPc, SCALE_FACTOR, HEIGHT_SCALE_DIVISOR);
      pcClone.querySelectorAll('img').forEach(function(img) { img.style.display = 'none'; });
      textLayer.appendChild(pcClone);
      newPage.appendChild(textLayer);
    }
    viewerContainer.appendChild(newPage);
  });
  fragment.appendChild(viewerContainer);
  document.body.appendChild(fragment);
  // mở hộp thoại in sau 1 giây
  setTimeout(function() { window.print(); }, 1000);
}
// khởi tạo
updateStatus('Sẵn sàng');