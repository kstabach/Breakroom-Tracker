function onOpen() {
  SpreadsheetApp.getUi()
      .createMenu('TEST MENU')
      .addItem('Hello World', 'helloWorld')
      .addToUi();
}

function helloWorld() {
  SpreadsheetApp.getUi().alert('The menu loaded!');
}
