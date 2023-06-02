import React from "react"


var localStorageMock = (function() {
    var store: { [persistKey: string] : string } = {}
    return {
      getItem: function(key: string) {
        return store[key]
      },
      setItem: function(key: string, value: string) {
        store[key] = value.toString()
      },
      clear: function() {
        store = {}
      },
      removeItem: function(key: string) {
        delete store[key]
      }
    }
  })()

Object.defineProperty(window, 'localStorage', { value: localStorageMock })

var sessionStorageMock = (function() {
  var store: { [persistKey: string] : string } = {}
  return {
    getItem: function(key: string) {
      return store[key]
    },
    setItem: function(key: string, value: string) {
      store[key] = value.toString()
    },
    clear: function() {
      store = {}
    },
    removeItem: function(key: string) {
      delete store[key]
    }
  }
})()

Object.defineProperty(window, 'sessionStorage', { value: sessionStorageMock })