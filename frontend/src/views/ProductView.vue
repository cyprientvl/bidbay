<script setup lang="ts">
import { ref, computed } from "vue";
import { useRoute, useRouter, RouterLink } from "vue-router";
import { useAuthStore } from "../store/auth";
import { flatMap } from "cypress/types/lodash";
import { Product } from "@/models/product";
import { User } from "@/models/user";
import { queryDelete, queryGet, queryPost } from "@/utils/queryAPI";
import { Bid } from "@/models/bid";
const { isAuthenticated, isAdmin, userData, token } = useAuthStore();

interface ViewProduct extends Product{
  bids: ViewProductBid[];
  seller: User;
}

interface ViewProductBid extends Bid{
  bidder: Bidder
}

interface Bidder{
  id: string,
  username: string
}

const product = ref<ViewProduct>({
  bids: [],  seller: {
    id: "df",
    username: "",
    email: "",
    password: "",
    admin: false
  }, id: "", name: "", description: "", category: "", originalPrice: 0, pictureUrl: "", endDate: new Date(), sellerId: "d"
});

const route = useRoute();
const router = useRouter();

const loading = ref(false);
const error = ref(false);

const productId = ref(route.params.productId);

const newPrice = ref<number>(10);

async function getProduct(){

  try{
    loading.value = true;
    const responses = await queryGet<ViewProduct>(`products/${productId.value}`);
    product.value = responses;
    console.log(product.value);
    error.value = false;
  }catch(e){
    error.value = true;
  }finally{
    loading.value = false;
  }
}

const reversed = computed(() => newPrice.value > getMaxBid() && newPrice.value > getMaxBid())

function timeLeft(date: Date){
    const d = new Date(date);
    const maintenant = new Date();

    if(maintenant.getTime() > d.getTime()) return "Terminé"

    const differenceEnMilliseconds = Math.abs(maintenant.getTime() - d.getTime());
    const jours = Math.floor(differenceEnMilliseconds / (1000 * 60 * 60 * 24));
    const heures = Math.floor((differenceEnMilliseconds % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((differenceEnMilliseconds % (1000 * 60 * 60)) / (1000 * 60));
    return `${jours}j ${heures}h ${minutes}min`
}

function getMaxBid(): number{
  let max = 0
  product.value.bids.forEach(element =>{
    if(max < element.price){
      max = element.price
    }
  })
  return max
}

async function addBid(){
  if(newPrice.value < 10 && newPrice.value <= getMaxBid()) return;

  loading.value = true
  try{
    await queryPost(`products/${product.value.id}/bids`, {price: newPrice.value})
    error.value = false;
    
  }catch(e){
    error.value = true;
  }finally{
    loading.value = false
  }
}

async function deleteProduct() {
  loading.value = true;
  try{
    await queryDelete(`products/${product.value.id}`)
    router.push({ name: "Home" });
    error.value = false;
  }catch(e){
    error.value = true;
  }finally{
    loading.value = false;
  }
}

async function deleteBid(id: string, index: number){
  loading.value = true;
  try{
    await queryDelete(`bids/${id}`)
    product.value.bids.splice(index, 1);
    error.value = false;
  }catch(e){
    error.value = true;
  }finally{
    loading.value = false;
  }
}

getProduct();

/**
 * @param {number|string|Date|VarDate} date
 */
function formatDate(date: Date) {
  const options: any = { year: "numeric", month: "long", day: "numeric" };
  return new Date(date).toLocaleDateString("fr-FR", options);
}
</script>

<template>
  <div class="row">
    <div class="text-center mt-4" data-test-loading v-if="loading">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Chargement...</span>
      </div>
    </div>

    <div class="alert alert-danger mt-4" role="alert" data-test-error v-if="error">
      Une erreur est survenue lors du chargement des produits.
    </div>
    <div class="row" data-test-product v-if="!loading">
      <!-- Colonne de gauche : image et compte à rebours -->
      <div class="col-lg-4">
        <img
          :src= product.pictureUrl
          alt=""
          class="img-fluid rounded mb-3"
          data-test-product-picture
        />
        <div class="card">
          <div class="card-header">
            <h5 class="card-title">Compte à rebours</h5>
          </div>
          <div class="card-body">
            <h6 class="card-subtitle mb-2 text-muted" data-test-countdown>
              Temps restant : {{ timeLeft(product.endDate) }}
            </h6>
          </div>
        </div>
      </div>

      <!-- Colonne de droite : informations du produit et formulaire d'enchère -->
      <div class="col-lg-8">
        <div class="row">
          <div class="col-lg-6">
            <h1 class="mb-3" data-test-product-name>
              {{product.name}}
            </h1>
          </div>
          <div class="col-lg-6 text-end" v-if="product.sellerId == useAuthStore().userId.value || useAuthStore().isAdmin.value">
            <RouterLink
              :to="{ name: 'ProductEdition', params: { productId: product.id } }"
              class="btn btn-primary"
              data-test-edit-product
            >
              Editer
            </RouterLink>
            &nbsp;
            <button v-on:click="deleteProduct()" class="btn btn-danger" data-test-delete-product>
              Supprimer
            </button>
          </div>
        </div>

        <h2 class="mb-3">Description</h2>
        <p data-test-product-description>
          {{product.description}}
        </p>

        <h2 class="mb-3">Informations sur l'enchère</h2>
        <ul>
          <li data-test-product-price>Prix de départ : {{product.originalPrice}} €</li>
          <li data-test-product-end-date>Date de fin : {{formatDate(product.endDate)}}</li>
          <li>
            Vendeur :
            <router-link
              :to="{ name: 'User', params: { userId: product.sellerId } }"
              data-test-product-seller
            >
              {{product.seller.username}}
            </router-link>
          </li>
        </ul>
        <h2 class="mb-3">Offres sur le produit</h2>
        <table class="table table-striped" data-test-bids v-if="product.bids.length != 0">
          <thead>
            <tr>
              <th scope="col">Enchérisseur</th>
              <th scope="col">Offre</th>
              <th scope="col">Date</th>
              <th scope="col"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, i) in product.bids" :key="i" data-test-bid>
              <td>
                <router-link
                  :to="{ name: 'User', params: { userId: item.bidder.id} }"
                  data-test-bid-bidder
                >
                  {{item.bidder.username}}
                </router-link>
              </td>
              <td data-test-bid-price>{{item.price}} €</td>
              <td data-test-bid-date>{{formatDate(item.date)}}</td>
              <td >
                <button v-if="item.bidder.id == useAuthStore().userId.value || useAuthStore().isAdmin.value" v-on:click="deleteBid(item.id, i)" class="btn btn-danger btn-sm" data-test-delete-bid>
                  Supprimer
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        <p data-test-no-bids v-if="product.bids.length == 0">Aucune offre pour le moment</p>

        <form data-test-bid-form v-if="useAuthStore().userId.value != product.sellerId">
          <div class="form-group">
            <label for="bidAmount">Votre offre :</label>
            <input
              type="number"
              class="form-control"
              id="bidAmount"
              v-model="newPrice"
              data-test-bid-form-price
            />
            <small class="form-text text-muted">
              Le montant doit être supérieur à {{ getMaxBid() }} €.
            </small>
          </div>
          <button
            type="submit"
            class="btn btn-primary"
            v-on:click="addBid()"
            :disabled = !reversed
            data-test-submit-bid
          >
            Enchérir
          </button>
        </form>
      </div>
    </div>
  </div>
</template>
