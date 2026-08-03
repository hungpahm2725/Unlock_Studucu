// Studocu Tool - Popup Logic

function updateStatus(msg, processing = false) {
  const bar = document.getElementById('status');
  const text = document.getElementById('status-text');
  if (bar) bar.classList.toggle('processing', processing);
  if (text) text.textContent = msg;
}

// BYPASS - Xóa cookie + reload 

document.getElementById('clearBtn').addEventListener('click', async () => {
  updateStatus('Đang xóa cookie...', true);
  try {
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

//  PDF - Tạo file PDF 

document.getElementById('checkBtn').addEventListener('click', async () => {
  updateStatus('Đang tạo PDF...', true);
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab) {
      updateStatus('Không tìm thấy tab');
      return;
    }

    await chrome.scripting.insertCSS({
      target: { tabId: tab.id },
      files: ['viewer_styles.css']
    });

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

//  PDF Creator (chạy trong trang) 

function runCleanViewer() {
  const pages = document.querySelectorAll('div[data-page-index]');

  if (pages.length === 0) {
    alert('Không tìm thấy trang nào!\n\nHãy cuộn chuột xuống cuối tài liệu để web tải hết nội dung trước!');
    return;
  }

  if (!confirm('Tìm thấy ' + pages.length + ' trang.\nBấm OK để tạo PDF...')) return;

  const SCALE_FACTOR = 4;
  const HEIGHT_SCALE_DIVISOR = 4;

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

    const transformOrigin = computedStyle.getPropertyValue('transform-origin');
    if (transformOrigin) {
      styleString += 'transform-origin: ' + transformOrigin + ' !important; ';
    }
    styleString += 'overflow: visible !important; max-width: none !important; max-height: none !important; clip: auto !important; clip-path: none !important; ';
    target.style.cssText += styleString;
  }

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

  const fragment = document.createDocumentFragment();
  const viewerContainer = document.createElement('div');
  viewerContainer.id = 'clean-viewer-container';

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

    const newPage = document.createElement('div');
    newPage.className = 'std-page';
    newPage.id = 'page-' + (index + 1);
    newPage.setAttribute('data-page-number', index + 1);
    newPage.style.width = width + 'px';
    newPage.style.height = height + 'px';

    const originalImg = page.querySelector('img.bi') || page.querySelector('img');
    if (originalImg) {
      const bgLayer = document.createElement('div');
      bgLayer.className = 'layer-bg';
      const imgClone = originalImg.cloneNode(true);
      imgClone.style.cssText = 'width: 100%; height: 100%; object-fit: cover; object-position: top center';
      bgLayer.appendChild(imgClone);
      newPage.appendChild(bgLayer);
    }

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

  setTimeout(function() { window.print(); }, 1000);
}

updateStatus('Sẵn sàng');
