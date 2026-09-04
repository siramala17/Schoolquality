/**
 * SMART SUPERVISION 360°
 * Entry point for the Apps Script web app.
 */
function doGet(e) {
  const template = HtmlService.createTemplateFromFile('Index');
  template.userInfo = getCurrentUserInfo();
  return template.evaluate()
    .setTitle('SMART SUPERVISION 360°')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}
