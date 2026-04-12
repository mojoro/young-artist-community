'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'

export async function deleteProgram(formData: FormData) {
  const id = formData.get('program_id') as string
  if (!id) throw new Error('Missing program_id')

  // Delete join rows + children first, then program
  await prisma.$transaction(async (tx) => {
    // Audition children
    const auditions = await tx.audition.findMany({
      where: { program_id: id },
      select: { id: true },
    })
    if (auditions.length > 0) {
      await tx.auditionInstrument.deleteMany({
        where: { audition_id: { in: auditions.map((a) => a.id) } },
      })
      await tx.audition.deleteMany({ where: { program_id: id } })
    }

    await tx.review.deleteMany({ where: { program_id: id } })
    await tx.programInstrument.deleteMany({ where: { program_id: id } })
    await tx.programCategory.deleteMany({ where: { program_id: id } })
    await tx.programLocation.deleteMany({ where: { program_id: id } })

    // Unlink import sources + candidates
    await tx.importSource.updateMany({
      where: { program_id: id },
      data: { program_id: null },
    })
    await tx.programCandidate.updateMany({
      where: { program_id: id },
      data: { program_id: null },
    })

    await tx.program.delete({ where: { id } })
  })

  revalidatePath('/admin/data')
  revalidatePath('/programs')
  revalidatePath('/')
}

export async function deleteReview(formData: FormData) {
  const id = formData.get('review_id') as string
  if (!id) throw new Error('Missing review_id')

  const review = await prisma.review.delete({ where: { id } })

  revalidatePath('/admin/data')
  revalidatePath(`/programs/${review.program_id}`)
}
