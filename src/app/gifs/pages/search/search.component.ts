import { Component, inject, signal } from '@angular/core';
import { ListComponent } from "../../components/list/list.component";
import { GifsService } from '../../services/gifs.service';
import { Gif } from '../../interfaces/gif.interface';

@Component({
  selector: 'app-search',
  imports: [ListComponent],
  templateUrl: './search.component.html',

})
export default class SearchComponent {

  gifService = inject( GifsService );
  gifs = signal<Gif[]>([]);

  onSearch( query: string ) {
    this.gifService.searchGifs(query)
      .subscribe( ( resp ) => {
        this.gifs.set(resp)
      });

  }


}
