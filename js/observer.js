class Observable {
    constructor() {
        this.observers = [];
    }

    subscribe(f) {
        this.observers.push(f);
    }

    unsubscribe(f) {
        this.observers = this.observers.filter(subscriber => subscriber !== f);
    }

    notify(data) {
        this.observers.forEach(observer => observer(data));
    }
}

const storyObservable = new Observable();

function toastify(data) {
    const toastContainer = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = data;

    toastContainer.appendChild(toast);

    // Animate and remove after 2 seconds
    setTimeout(() => toast.remove(), 2000);
}

storyObservable.subscribe(toastify);

function logger(data) {
    console.log(`${Date.now()} ${data}`);
}
storyObservable.subscribe(logger);
