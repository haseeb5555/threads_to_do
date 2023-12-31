"use server"

import { FilterQuery, SortOrder } from "mongoose";
import Thread from "../models/thread.model";
import User from "../models/user.model";
import { connectToDB } from "./mongoose";
import { revalidatePath } from 'next/cache'


 interface Params{
    userId:string;username:string;name:string;bio:string;image:string;path:string
}

export  async function updateUser({userId,username,name,bio,image,path}:Params) :Promise<void>{

connectToDB();

try {
    await User.findOneAndUpdate({id:userId},{
        username:username.toLowerCase(),
        name,
        bio,
        image,
        onboarded:true
      },{
          upsert:true
      })
      
      if (path==="/profile/edit"){
          revalidatePath(path);
      }
} catch (error:any) {
    console.log(error)
}

}


export async function fetchUser(userId:string){
    try {
        connectToDB();
       return await User.findOne({id:userId})
    } catch (error:any) {
        console.log(error)
    }
}

export async function fetchUserPosts(userId:string){
   try {
     connectToDB();
     // fetch thread that authored by user who created them by user id 
     const threads = await User.findOne({id:userId})
     .populate({
        path:'threads',
        model:Thread,
        populate:{
            path:'children',
            model:Thread,
            populate:{
                path:"author",
                model:User,
                select:" name image id"
            }
        }
     })
          return threads;
   } catch (error:any) {
      console.log(error)
   }
}


export async function fetchUsers({userId, searchString='',pageNumber=1 ,pageSize=20 ,sortBy='desc' }:{
    userId:string;
    searchString?:string
  pageNumber?:number
   pageSize?:number
   sortBy?:SortOrder

}){
    try {
        connectToDB();  
        const skipAmount = (pageNumber-1)* pageSize

        const regex = new RegExp(searchString,'i')

        const query :FilterQuery<typeof User> ={
            id:{$ne:userId}
        }
        if(searchString.trim() !== ''){
              query.$or =[
                {username:{$regex:regex}},
                {name:{$regex:regex}}
              ]
        }

        const sortOptions ={createdAt:sortBy}
        const  userQuery = User.find(query)
        .sort(sortOptions)
        .skip(skipAmount)
        .limit(pageSize)

        const totalUserCount = await User.countDocuments(query)
         const users = await userQuery.exec();
         const isNext = totalUserCount> skipAmount+ users.length;
         return {users,isNext}
     } catch (error:any) {
        console.log(error)  
     }
}


export async function getActivities(userId:string){
try {
    connectToDB();

    // find all threads created by user
    const userThreads = await Thread.find({author:userId})

    // colect all child ids of threads (replies) from the children(comment)
    const userThreadsIds = userThreads.reduce((acc,userThread)=>{
     return acc.concat(userThread.children)
    },[])

    const replies = await Thread.find({
        _id:{$in:userThreadsIds},
        author:{$ne:userId}

    }).populate({
        path:'author',
        model:User,
        select:"name image _id "
    })
    return replies;
} catch (error:any) {
    console.log(error)
}
}