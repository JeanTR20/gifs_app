import { Component, computed, ElementRef, inject, signal, viewChild } from '@angular/core';
import { ListComponent } from "../../components/list/list.component";
import { GifsService } from '../../services/gifs.service';

@Component({
  selector: 'app-trending',
  // imports: [ListComponent],
  templateUrl: './trending.component.html',

})
export default class TrendingComponent {
  gifService = inject( GifsService )
  // gifs = computed( () => this.gifService.trendingGifs() )

  scrollDivRef = viewChild<ElementRef<HTMLDivElement>>('groupDiv')

  onScroll( event: Event  ) {
    const scrollDiv = this.scrollDivRef()?.nativeElement;
    if ( !scrollDiv) return;

    const scrollTop = scrollDiv.scrollTop;
    const clientHeigth = scrollDiv.clientHeight;
    const scrollHeight = scrollDiv.scrollHeight;
    // console.log({ scrolltop: scrollTop + clientHeigth, scrollHeight})
    const isAtBotton = scrollTop + clientHeigth + 300 >= scrollHeight;

    if ( isAtBotton) {
      this.gifService.loadTrendingGifs();
    }
  }
}
