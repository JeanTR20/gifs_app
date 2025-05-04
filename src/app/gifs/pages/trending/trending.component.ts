import { AfterViewInit, Component, ElementRef, inject, viewChild } from '@angular/core';
import { GifsService } from '../../services/gifs.service';
import { ScrollStateService } from 'src/app/shared/services/scroll-state.service';

@Component({
  selector: 'app-trending',
  templateUrl: './trending.component.html',

})
export default class TrendingComponent implements AfterViewInit {

  gifService = inject( GifsService );
  scrollService = inject( ScrollStateService );
  // gifs = computed( () => this.gifService.trendingGifs() )

  scrollDivRef = viewChild<ElementRef<HTMLDivElement>>('groupDiv');

  ngAfterViewInit(): void {
    const scrollDiv = this.scrollDivRef()?.nativeElement;

    if(!scrollDiv) return;

    scrollDiv.scrollTop = this.scrollService.trendingScrollState();
  }

  onScroll( event: Event  ) {
    const scrollDiv = this.scrollDivRef()?.nativeElement;
    if ( !scrollDiv) return;

    const scrollTop = scrollDiv.scrollTop;
    const clientHeigth = scrollDiv.clientHeight;
    const scrollHeight = scrollDiv.scrollHeight;
    // console.log({ scrolltop: scrollTop + clientHeigth, scrollHeight})
    const isAtBotton = scrollTop + clientHeigth + 300 >= scrollHeight;

    this.scrollService.trendingScrollState.set(scrollTop)

    if ( isAtBotton) {
      this.gifService.loadTrendingGifs();
    }
  }
}
