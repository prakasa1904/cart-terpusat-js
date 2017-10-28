const cart = {
  action: 'add',
  perItem: 0,
  currency: function(numb){
    if (!numb) {
      return '0'
    }

    const num = numb.toString().replace(/\D/g, '')

    if (num === '') {
      return '0'
    }

    if (num.length <= 3) {
      return num // Return format 300 || 0
    }

    const result = num.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1.')
    return result // Return format 3.000.000 || 4.500
  },
  getCreated: function(){
    const data = JSON.parse(readCookie('cart'))
    if (data && data.create) {
      return data.create
    }
    return false
  },
  getTotalWeight: function(){
    const data = JSON.parse(readCookie('cart'))
    if (data && data.total) {
      return data.item.reduce(function(sum, item) {
        return sum.w + item.w
      }, 0)
    }
    return 0
  },
  getTotal: function(){
    const data = JSON.parse(readCookie('cart'))
    if (data && data.total) {
      return data.total
    }
    return 0
  },
  getItem: function(index = 0){
    const data = JSON.parse(readCookie('cart'))
    if (data && data.item[index]) {
      return data.item[index]
    }
    return false
  },
  getInvoice: function(){
    const data = JSON.parse(readCookie('cart'))
    if (data && data.invoice) {
      return data.invoice
    }
    return 0
  },
  removeItem: function(params){
    const id = $(params).data('remove')
    const existCart = JSON.parse(readCookie('cart'))
    const itemMap = existCart.item.map(x => x.i === id)
    const itemExist = itemMap.includes(true)
    if (itemExist) {
      const keyItem = itemMap.findIndex(x => x)
      existCart.item.splice(keyItem, 1)
      existCart.total = existCart.item.length
      createCookie('cart', JSON.stringify(existCart), 1)
      $('#remove-cart-' + id).remove()
      location.reload()
    }
  },
  pushCourir: function(params){
    if (readCookie('cart')) {
      const existCart = JSON.parse(readCookie('cart'))
      const courir = $(params).data('courir') || 'jne'
      const package = $(params).data('package') || ''
      const price = $(params).data('price') || 0
      const total = $(params).data('total') || 0
      existCart.courir = {
        service: courir,
        pack: package,
        price: price,
      }
      createCookie('cart', JSON.stringify(existCart), 1)
      $('#total-price').html(`Rp. ${this.currency(Math.ceil(total+price))}`)
    } else {
      sweetAlert("Maaf...", 'Anda belum memiliki item di cart', "error")
    }
  },
  pushTotal: function(params){
    if ($(params).val() > 0) {
      this.perItem = $(params).val()
    } else {
      $(params).val(1)
    }
  },
  pushCart: function(params) {
    if (readCookie('user')) {
      const userData = JSON.parse(readCookie('user'))
      const id = $(params).data('id') || 0
      const price = $(params).data('price') || 0
      const action = $(params).data('action') ? $(params).data('action') : this.action
      const total = $(params).data('total') && this.perItem === 0 ? $(params).data('total') : this.perItem
      const discount = $(params).data('discount') || 0
      const weight = $(params).data('weight') || 1
      if (readCookie('cart')) {
        const existCart = JSON.parse(readCookie('cart'))
        const itemMap = existCart.item.map(x => x.i === id)
        const itemExist = itemMap.includes(true)

        if (itemExist) {
          const keyItem = itemMap.findIndex(x => x)
          const existTotal = action === 'add' ? (existCart.item[keyItem].t + parseInt(total, 10)) : parseInt(total, 10)
          existCart.item[keyItem] = {
            i: id,
            p: price,
            d: discount,
            t: existTotal,
            w: (weight * existTotal),
          }
        } else {
          const newItem = {
            i: id,
            p: price,
            d: discount,
            t: parseInt(total, 10),
            w: weight,
          }

          existCart.item.push(newItem)
        }
        existCart.total = existCart.item.length
        createCookie('cart', JSON.stringify(existCart), 1)
      } else {
        const initial = {
          item: [],
          total: 0,
          user: parseInt(userData.i, 10),
          create: creatAt(),
        }

        const newItem = {
          i: id,
          p: price,
          d: discount,
          t: parseInt(total, 10),
          w: weight,
        }
        initial.item.push(newItem)
        initial.total = initial.item.length
        createCookie('cart', JSON.stringify(initial), 1)
      }
      this.perItem = 1
      this.action = 'add'
      $('.item-cart').text(this.getTotal())
      sweetAlert("Terimakasih...", 'Sukses Menambah Ke Keranjang', "success")
    } else {
      window.location = `${location.protocol}//${window.location.host}/login`
    }
  },
  payment: function(payment){
    if (readCookie('cart')) {
      const existCart = JSON.parse(readCookie('cart'))
      if (existCart.item.length === 0) {
        sweetAlert("Maaf...", 'Keranjang belanja anda masih kosong', "error")
        return false
      }

      if (!existCart.courir) {
        sweetAlert("Maaf...", 'Anda belum memilih biaya pengiriman', "error")
        return false
      }

      window.location.href = payment
    } else {
      sweetAlert("Maaf...", 'Keranjang belanja anda masih kosong', "error")
      return false
    }
  },
  pushInvoice: function(invoice){
    if (readCookie('user')) {
      const userData = JSON.parse(readCookie('user'))
      if (readCookie('cart')) {
        const existCart = JSON.parse(readCookie('cart'))
        if (existCart.user !== parseInt(userData.i, 10)) {
          window.location.href = `${location.protocol}//${window.location.host}/cart`
        } else {
          existCart.invoice = invoice
          createCookie('cart', JSON.stringify(existCart), 1)
        }
      }
    }
  }
}