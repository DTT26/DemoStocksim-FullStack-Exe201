import { init, dispose } from 'klinecharts';

const dummyDiv = document.createElement('div');
dummyDiv.style.width = '500px';
dummyDiv.style.height = '500px';
document.body.appendChild(dummyDiv);

const chart = init(dummyDiv);
if (chart) {
  console.log(JSON.stringify(chart.getStyles(), null, 2));
  dispose(dummyDiv);
}
