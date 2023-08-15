import UserCard from "@/components/cards/UserCard";
import PostThread from "@/components/forms/PostThread";
import { fetchUser, fetchUsers } from "@/lib/actions/user.actions";
import {currentUser} from "@clerk/nextjs"
import { redirect } from "next/navigation";

async function Page () {

     const user = await currentUser();
     if(!user) return null;
     const userInfo = await fetchUser(user.id)

      if(!userInfo?.onboarded) redirect('/onboarding')

      const result = await fetchUsers({userId:user.id,
        searchString:'',
        pageNumber:1,
        pageSize:25})
  return (
    <div>
      <h1 className="head-text mb-10">Search</h1> 

      <div className="mt-14 flex flex-col gap-9">
           {result?.users.length === 0 ?
            (
                <p className="no-result">No user found</p>
            ):(
               <>
               {result?.users.map((person)=>(
                <UserCard
                 key={person.id}
                 id={person.id}
                 name={person.name}
                 usernmae={person.username}
                 imgUrl ={person.image}
                 personType='User'
                
                />
                 
               ))}
               </> 
            )
        }
      </div>
    </div>
  )
}

export default Page
