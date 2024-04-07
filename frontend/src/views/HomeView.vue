<script setup lang="ts">
import { ref, computed } from "vue";
import { queryGet } from "@/utils/queryAPI";
import { Bid } from "@/models/bid";
import { Product } from "@/models/product";
import { User } from "@/models/user";

interface HomeViewProduct extends Product{
  bids: Bid[];
  seller: User;
  name: string;
}



const loading = ref(true);
const error = ref(true);
const searchTerm = ref<string>("");
const selectedFilter = ref<string>("nom");
let list = ref<HomeViewProduct[]>([])


async function fetchProducts() {
  loading.value = true;
  error.value = false;
  try {
    const response = await queryGet<HomeViewProduct[]>("products");
    list.value = response;
    error.value = false;
    if (response.length === 0) {
      error.value = true;
    }
  } catch (e) {
    error.value = true;
  } finally {
    loading.value = false;
  }
}

function formatDate(value: Date): string {
      if(new Date().getTime() > new Date(value).getTime()) return "Terminé"
      return "En cours jusqu'au " +new Date(value).toLocaleDateString();
}

function getPrice(item: HomeViewProduct): number{
  if(item.bids.length == 0){
    return item.originalPrice;
  }else{
    return item.bids[0].price;
  }
}

function getTextPrice(item: HomeViewProduct){
  if(item.bids.length == 0){
    return "Prix de départ : ";
  }else{
    return "Prix actuel : ";
  }
}

const filteredProducts = computed(() => {
  if (searchTerm.value) {
    return list.value.filter(product => product.name.toLowerCase().includes(searchTerm.value.toLowerCase()));
  } else {
    return list.value;
  }
});

const sortedProducts = computed(() => {
  if (selectedFilter.value === "nom") {
    console.log("name")
    return [...filteredProducts.value].sort((a, b) => a.name.localeCompare(b.name));
  } else if (selectedFilter.value === "prix") {
    console.log("price")
    return [...filteredProducts.value].sort((a, b) => getPrice(a) - getPrice(b));
  } else {
    return filteredProducts.value;
  }
});

fetchProducts();
</script>

<template>
  <div>
    <h1 class="text-center mb-4" >Liste des produits</h1>

    <div class="row mb-3">
      <div class="col-md-6">
        <form>
          <div class="input-group">
            
            <span class="input-group-text">Filtrage</span>
            <input
              type="text"
              class="form-control"
              placeholder="Filtrer par nom"
              v-model="searchTerm"
              data-test-filter
            />
          </div>
        </form>
      </div>
      <div class="col-md-6 text-end">
        <div class="btn-group">
          <button
            type="button"
            class="btn btn-primary dropdown-toggle"
            data-bs-toggle="dropdown"
            aria-expanded="false"
            data-test-sorter
          >
            Trier par {{ selectedFilter ? selectedFilter : 'nom' }}
          </button>

          <ul class="dropdown-menu dropdown-menu-end">
            <li>
              <a class="dropdown-item" href="#" @click="selectedFilter = 'nom'"> Nom </a>
            </li>
            <li>
              <a class="dropdown-item" href="#" @click="selectedFilter = 'prix'" data-test-sorter-price>
                Prix
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <div class="text-center mt-4" data-test-loading v-if="loading">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Chargement...</span>
      </div>
    </div>

    <div class="alert alert-danger mt-4" role="alert" data-test-error v-if="(error )" >
      {{error}}
    </div>
    <div class="row" v-if="list.length > 0">
      <div class="col-md-4 mb-4" v-for="(item, i) in sortedProducts" data-test-product :key="i">
        <div class="card">
          <RouterLink :to="{ name: 'Product', params: { productId: item.id } }">
            <img
              :src= item.pictureUrl
              data-test-product-picture
              class="card-img-top"
            />
          </RouterLink>
          <div class="card-body">
            <h5 class="card-title">
              <RouterLink
                data-test-product-name
                :to="{ name: 'Product', params: { productId: item.id } }"
              >
                {{item.name}}
              </RouterLink>
            </h5>
            <p class="card-text" data-test-product-description>
              {{item.description}}
            </p>
            <p class="card-text">
              Vendeur :
              <RouterLink v-if="item.seller"
                data-test-product-seller
                :to="{ name: 'User', params: { userId: item.seller.id } }"
              >
                {{item.seller.username}}
              </RouterLink>
            </p>
            <p class="card-text" data-test-product-date>
              {{ formatDate(item.endDate) }}
            </p>
            <p class="card-text" v-if="item.bids !== undefined" data-test-product-price>{{getTextPrice(item)}} {{getPrice(item)}} €</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
