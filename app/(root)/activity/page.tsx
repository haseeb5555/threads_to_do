
import { fetchUser, getActivities } from "@/lib/actions/user.actions";
import {currentUser} from "@clerk/nextjs"
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

async function Page () {

     const user = await currentUser();
     if(!user) return null;
     const userInfo = await fetchUser(user.id)

      if(!userInfo?.onboarded) redirect('/onboarding')

      const activity = await getActivities(userInfo._id)
    return (
      <div>
        <h1 className="head-text mb-10">Activity</h1> 
        <section className="mt-10 flex flex-col gap-5">
          {activity.length > 0 ? (
            <>
             {activity?.map((activity)=>(
                  <Link key={activity._id} href={`/thread/${activity.parentId}`}>
                        <article className="activity-card">
                             <Image
                             
                             src={activity.author.image}
                             alt="pic"
                             width={20}
                             height={20}
                             className="rounded-full"
                             
                             
                             />

                              <p className="!text-base-regular text-light-1">
                                <span className="text-primary-500 mr-1">
                                {activity.author.name}
                                </span>{" "}
                                Comment on your thread
                              </p>
                          </article>   
                  </Link>
             ))}
            </>
          ):<p className="!text-base-regular text-gray-500">No activity yet!</p>}
        </section>
      </div>
    )
  }
  
  export default Page
  