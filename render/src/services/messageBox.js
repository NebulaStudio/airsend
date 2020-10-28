export default class MessageBox {
  constructor() {
    this._notification = null;
    this._permission = null;
    this.init();
  }

  init() {
    try {
      Notification.requestPermission().then((status) => {
        this._permission = status;
      });
    } catch {
      Notification.requestPermission((status) => {
        this._permission = status;
      });
    }
  }

  show(body, icon) {
    if (this._permission !== 'granted') return;
    const title = '隔空发送';
    const options = {
      body,
      icon,
    };
    this._notification = new Notification(title, options);
  }

  close() {
    if (this._notification) {
      this._notification.close();
    }
  }
}
