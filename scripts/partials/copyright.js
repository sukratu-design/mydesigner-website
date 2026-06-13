function getCopyrightYear() {
  return new Date().getFullYear();
}

function copyrightText() {
  return `© ${getCopyrightYear()} MyDesigner by Sukratu. All rights reserved.`;
}

function copyrightHtml() {
  return `&copy; ${getCopyrightYear()} MyDesigner by <a href="https://sukratu.co" target="_blank" rel="noopener">Sukratu</a>. All rights reserved.`;
}

module.exports = { getCopyrightYear, copyrightText, copyrightHtml };
