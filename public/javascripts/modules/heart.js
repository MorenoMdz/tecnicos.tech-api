import axios from 'axios';
import { $ } from './bling';

function ajaxStar(e) {
  e.preventDefault();
  axios
    .post(this.action)
    .then(res => {
      // access the element by the element name, this case this.Star
      const isStared = this.star.classList.toggle('star-button-Stared');
      $('.Star-count').textContent = res.data.Stars.length;
      // animation
      if (isStared) {
        this.Star.classList.add('star-button-float');
        setTimeout(() => this.Star.classList.remove('star-button-float'), 2500);
      }
    })
    .catch(console.error);
}

export default ajaxStar;
