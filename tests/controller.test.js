const ezt = require("../dist/ezt");
const { filter } = require("rxjs/operators");
const { Controller, dispatch, respondTo } = ezt;

test("Controller", () => {
  class MyController extends Controller {
    unbindSignalSent = false;
    oddNumCount = 0;
    evenNumCount = 0;

    sendOddNum() {
      this.oddNumCount++;
    }

    sendEvenNum() {
      this.evenNumCount++;
    }
  }

  const myController = new MyController();
  myController.sendOddNum.pipes = filter(n => n % 2 != 0);
  myController.sendEvenNum.pipes = filter(n => n % 2 == 0);

  myController.bind();
  [1, 1, 1, 1, 1].forEach(n => {
    dispatch("sendOddNum", n);
    dispatch("sendEvenNum", n);
  });
  expect(myController.oddNumCount).toBe(5);
  expect(myController.evenNumCount).toBe(0);

  myController.unbind();
  [1, 2, 3, 4, 5].forEach(n => {
    dispatch("sendOddNum", n);
    dispatch("sendEvenNum", n);
  });
  expect(myController.oddNumCount).toBe(5);
  expect(myController.evenNumCount).toBe(0);

  respondTo("controllerUnbind", () => (myController.unbindSignalSent = true));
  myController.respond("controllerUnbind");
  expect(myController.unbindSignalSent).toBe(true);
});
