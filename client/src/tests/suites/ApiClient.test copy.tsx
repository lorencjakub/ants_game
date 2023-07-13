import React from "react"
import ApiClient from "../../base/utils/Axios/ApiClient"
import { TEST_CONFIG } from "../testSetup"
import { TEST_CARD_WALL } from "../MockedApiValues"


describe("Test of APi functions", () => {
    test("joinRoom fn", async () => {
        expect(await ApiClient.joinRoom(TEST_CONFIG.DEFAULT_ROOM_GUID)).toEqual([`/join_room/${TEST_CONFIG.DEFAULT_ROOM_GUID}`])

        try {
            await ApiClient.joinRoom()
        } catch (e: any) {
            expect(e).toEqual({ response: { data: { message: "invalid_room" } } })
        }
    })

    test("lockRoom fn", async () => {
        expect(await ApiClient.lockRoom(TEST_CONFIG.DEFAULT_ROOM_GUID)).toEqual([`/lock_room/${TEST_CONFIG.DEFAULT_ROOM_GUID}`])

        try {
            await ApiClient.lockRoom(null as any)
        } catch (e: any) {
            expect(e).toEqual({ response: { data: { message: "invalid_room" } } })
        }
    })

    test("play fn", async () => {
        expect(await ApiClient.play(TEST_CARD_WALL.item_name)).toEqual(["/play_card", { card_name: TEST_CARD_WALL.item_name }])

        try {
            await ApiClient.play(null as any)
        } catch (e: any) {
            expect(e).toEqual({ response: { data: { message: "no_card" } } })
        }
    })

    test("discard fn", async () => {
        expect(await ApiClient.discard(TEST_CARD_WALL.item_name)).toEqual(["/discard", { card_name: TEST_CARD_WALL.item_name }])

        try {
            await ApiClient.discard(null as any)
        } catch (e: any) {
            expect(e).toEqual({ response: { data: { message: "no_card" } } })
        }
    })
})