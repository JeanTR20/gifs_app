import { HttpClient } from '@angular/common/http';
import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { environment } from '@environments/environment';
import type { GiphyResponse } from '../interfaces/giphy.interfaces';
import { Gif } from '../interfaces/gif.interface';
import { GifMapper } from '../mapper/gif.mapper';
import { map, Observable, tap } from 'rxjs';

const GIF_KEY = 'gifs'

const loadFronLocalStorage = (): Record<string, Gif[]> => {
  try {
    const gifsFromLocalStorage = localStorage.getItem(GIF_KEY) ?? '{}';

    if (!gifsFromLocalStorage) return {}

    const parse = JSON.parse(gifsFromLocalStorage);
    return typeof parse === 'object' && !Array.isArray(parse) ? parse : {};

  } catch (error) {
    return {};
  }
}

@Injectable({providedIn: 'root'})
export class GifsService {

  private http = inject(HttpClient);

  trendingGifs = signal<Gif[]>([]); //[gif,gif,gif,gif,gif,gif,gif]
  trendingGifsLoading = signal(false);

  private trendingPage = signal(0);



  // [ [gif,gif,gif], [gif,gif,gif],[gif,gif,gif],[gif,gif,gif] ]
  trendingGifGroup = computed<Gif[][]>(() => {
    const groups = [];

    for(let i = 0; i < this.trendingGifs().length; i += 3 ) {
      groups.push(this.trendingGifs().slice(i, i + 3) );
    }
    return groups;
  })

  searchHistory = signal<Record<string, Gif[]>>( loadFronLocalStorage() );
  searchHistoryKeys = computed(() => Object.keys(this.searchHistory()) );

  saveGifsToLocalStorage = effect(() => {
    const historyString = JSON.stringify( this.searchHistory() );
    localStorage.setItem(GIF_KEY, historyString );

    // localStorage.setItem('gifs', JSON.stringify( this.searchHistory()) )
  })

  constructor() {
    this.loadTrendingGifs();

  }


  loadTrendingGifs() {

    if (this.trendingGifsLoading() ) return;

    this.trendingGifsLoading.set(true);

    this.http.get<GiphyResponse>(`${ environment.giphyApiUrl }/gifs/trending`, {
      params: {
        api_key: environment.giphyApiKey,
        limit: 20,
        offset: this.trendingPage() * 20,
      }
    }).subscribe( ( resp ) => {
      // resp.data[0].images.original.url
      // console.log({resp})

      const gifs = GifMapper.mapGiphyItemsToGifArray(resp.data);
      this.trendingGifs.update(currentGifs => [ ...currentGifs, ...gifs ]);

      this.trendingPage.update((page) => page + 1)

      this.trendingGifsLoading.set(false);
    });
  }

  searchGifs(query: string): Observable<Gif[]> {
    return this.http.get<GiphyResponse>(`${ environment.giphyApiUrl }/gifs/search`, {
      params: {
        api_key: environment.giphyApiKey,
        limit: 20,
        q: query,
      }
    }).pipe(
      map( ({ data }) => data ),
      map(  ( items ) => GifMapper.mapGiphyItemsToGifArray( items ) ),

      //Todo: historial
      tap( items => {
        this.searchHistory.update( history => ({
          ...history,
          [query.toLowerCase()]: items,
        }))
      })
    );
  }

  getHistoryGifs( query: string ) : Gif[] {
    return this.searchHistory()[query] ?? [];
  }

}
