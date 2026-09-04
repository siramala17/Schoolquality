/**
 * Evidence file storage on Google Drive.
 */
function saveEvidenceFile_(base64Data, fileName, mimeType) {
  const folder = getEvidenceFolder();
  const decoded = Utilities.base64Decode(base64Data.split(',').pop());
  const blob = Utilities.newBlob(decoded, mimeType, fileName);
  const file = folder.createFile(blob);
  file.setSharing(DriveApp.Access.DOMAIN_WITH_LINK, DriveApp.Permission.VIEW);
  return { id: file.getId(), url: file.getUrl(), name: file.getName() };
}
