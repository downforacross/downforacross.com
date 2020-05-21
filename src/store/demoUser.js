import User from './user';

export default class DemoUser extends User {
  constructor(fb) {
    super();
    this.fb = fb;
    this.attached = false;
  }

  attach() {
    setTimeout(() => {
      this.attached = true;
      this.emit('auth');
    }, 0);
  }

  detach() {}

  logIn() {
    this.fb = {
      id: 'demo-fb-id',
    };
    this.emit('auth');
  }
}

let globalUser;
export const getUser = () => {
  if (!globalUser) {
    globalUser = new DemoUser();
    globalUser.attach();
  }
  return globalUser;
};
