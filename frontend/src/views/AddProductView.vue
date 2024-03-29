<script setup lang="ts">
import { useAuthStore } from "../store/auth";
import { useRouter } from "vue-router";
import { ref, computed } from "vue";
import { queryPost } from "@/utils/queryAPI";

const { isAuthenticated, token } = useAuthStore();
const router = useRouter();
const error = ref(false);
const loading = ref(false);


const inputProductName = ref<string>("");
const inputProductDescription = ref<string>("");
const inputProductCategorie = ref<string>("");
const inputProductStartPrice = ref<number>(0);
const inputProductUrl = ref<string>("");
const inputProductEndDate = ref<string>("");


if (!isAuthenticated.value) {
  router.push({ name: "Login" });
}
async function addProduct(){
  try{
    loading.value = true;
    await queryPost("products", 
    {name: inputProductName.value, description: inputProductDescription.value,category: inputProductCategorie.value,originalPrice: inputProductStartPrice.value ,pictureUrl: inputProductUrl.value ,endDate: inputProductEndDate.value})
    error.value = false;
  }catch(e){
    error.value = true;
  }finally{
    loading.value = false;
  }
}

const reversed = computed(() =>{

  if(inputProductCategorie.value.trim() != "" 
  && inputProductDescription.value.trim() != ""
  && inputProductCategorie.value.trim() != ""
  && inputProductStartPrice.value != 0
  && inputProductUrl.value.trim() != ""
  && inputProductEndDate.value.trim() != ""
  ) return true;
  return false

} )


</script>

<template>
  <h1 class="text-center">Ajouter un produit</h1>

  <div class="row justify-content-center">
    <div class="col-md-6">
      <form>
        <div class="alert alert-danger mt-4" role="alert" data-test-error v-if="error">
          Une erreur s'est produite
        </div>

        <div class="mb-3">
          <label for="product-name" class="form-label"> Nom du produit </label>
          <input
            type="text"
            class="form-control"
            id="product-name"
            v-model="inputProductName"
            required
            data-test-product-name
          />
        </div>

        <div class="mb-3">
          <label for="product-description" class="form-label">
            Description
          </label>
          <textarea
            class="form-control"
            id="product-description"
            name="description"
            v-model="inputProductDescription"
            rows="3"
            required
            data-test-product-description
          ></textarea>
        </div>

        <div class="mb-3">
          <label for="product-category" class="form-label"> Catégorie </label>
          <input
            type="text"
            class="form-control"
            id="product-category"
            v-model="inputProductCategorie"
            required
            data-test-product-category
          />
        </div>

        <div class="mb-3">
          <label for="product-original-price" class="form-label">
            Prix de départ
          </label>
          <div class="input-group">
            <input
              type="number"
              class="form-control"
              id="product-original-price"
              name="originalPrice"
              step="1"
              min="0"
              v-model="inputProductStartPrice"
              required
              data-test-product-price
            />
            <span class="input-group-text">€</span>
          </div>
        </div>

        <div class="mb-3">
          <label for="product-picture-url" class="form-label">
            URL de l'image
          </label>
          <input
            type="url"
            class="form-control"
            id="product-picture-url"
            name="pictureUrl"
            required
            v-model="inputProductUrl"
            data-test-product-picture
          />
        </div>

        <div class="mb-3">
          <label for="product-end-date" class="form-label">
            Date de fin de l'enchère
          </label>
          <input
            type="date"
            class="form-control"
            id="product-end-date"
            name="endDate"
            required
            v-model="inputProductEndDate"
            data-test-product-end-date
          />
        </div>

        <div class="d-grid gap-2">
          <button v-on:click="addProduct()"
            type="submit"
            class="btn btn-primary"
            :disabled = !reversed
            data-test-submit
          >
            Ajouter le produit
            <span v-if="loading"
              data-test-spinner
              class="spinner-border spinner-border-sm"
              role="status"
              aria-hidden="true"
            ></span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
