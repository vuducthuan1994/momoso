<template>
  <p><% myprop %></p>
</template>

<script>
module.exports = {
  props: ["myprop"],
  delimiters: ["<%", "%>"],
  mounted: function() {
    console.log("The props are also available in JS:");
  },
  watch: {
    myprop: function(newVal, oldVal) {
      console.log("Prop changed: ", newVal, " | was: ", oldVal);
    }
  }
};
</script>

<style>
.hello {
  background-color: #ffe;
}
</style>