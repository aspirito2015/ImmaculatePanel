import asyncio
from datetime import datetime

async def kill_time(num):
    print('Running:', num)
    await asyncio.sleep(1)
    print('Finished:', num)


async def main():
    startTime = datetime.now()
    print(f'{startTime}\tStarted!')
    list_of_tasks = []
    for i in range(1, 100 + 1):
        list_of_tasks.append(kill_time(i))
    asyncio.sleep(2)
    await asyncio.gather(*list_of_tasks)
    endTime = datetime.now()
    duration = endTime - startTime
    print(f'{endTime}\tDone in {duration}!')


if __name__ == '__main__':
    asyncio.run(main())