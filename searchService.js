// ==========================================
// EchoCall AI Backend
// File: server/services/searchService.js
// ==========================================

// ==========================================
// Imports
// ==========================================

import axios from "axios";

// ==========================================
// Environment Variables
// ==========================================

const SEARCH_API_KEY =
    process.env.SEARCH_API_KEY;

const SEARCH_ENGINE_ID =
    process.env.SEARCH_ENGINE_ID;

// ==========================================
// Google Custom Search
// ==========================================

export async function searchWeb(

    query,

    limit = 5

){

    try{

        const response =

            await axios.get(

                "https://www.googleapis.com/customsearch/v1",

                {

                    params:{

                        key:

                        SEARCH_API_KEY,

                        cx:

                        SEARCH_ENGINE_ID,

                        q:

                        query,

                        num:

                        limit

                    }

                }

            );

        const items =

            response.data.items || [];

        return items.map(item=>({

            title:

            item.title,

            snippet:

            item.snippet,

            link:

            item.link

        }));

    }

    catch(error){

        console.error(

            "Search Error:",

            error.response?.data ||

            error.message

        );

        throw error;

    }

}

// ==========================================
// End of File
// ==========================================